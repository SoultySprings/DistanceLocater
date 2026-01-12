import { useState, useEffect } from 'react';
import MapComponent from './components/Map';
import InputPanel from './components/InputPanel';
import { Header } from './components/Header';
import ResultsPanel from './components/ResultsPanel';
import WelcomeScreen from './components/WelcomeScreen';
import HelpButton from './components/HelpButton';
import type { LocationPoint, DistanceResult } from './types';
import { geocodeAddress, reverseGeocode } from './utils/geocoding';
import { calculateRoute, normalizeLng } from './utils/distanceCalculator';
import { Calculator, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

// Simple UUID generator since we didn't install uuid package
const generateId = () => Math.random().toString(36).substr(2, 9);

const initialPoint: LocationPoint = { id: generateId(), address: '', coords: null, loading: false };

// Helper to normalize a point
const normalizePoint = (p: LocationPoint): LocationPoint => ({
  ...p,
  coords: p.coords ? { ...p.coords, lng: normalizeLng(p.coords.lng) } : null
});

function App() {
  const [origins, setOrigins] = useState<LocationPoint[]>(() => {
    const saved = localStorage.getItem('origins');
    const points = saved ? JSON.parse(saved) : [{ ...initialPoint }];
    return points.map(normalizePoint);
  });
  const [destinations, setDestinations] = useState<LocationPoint[]>(() => {
    const saved = localStorage.getItem('destinations');
    const points = saved ? JSON.parse(saved) : [{ ...initialPoint, id: generateId() }];
    return points.map(normalizePoint);
  });
  const [mode, setMode] = useState<'one-to-many' | 'many-to-many'>(() => {
    const saved = localStorage.getItem('mode');
    return (saved as 'one-to-many' | 'many-to-many') || 'one-to-many';
  });
  const [results, setResults] = useState<DistanceResult[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [fitBoundsTrigger, setFitBoundsTrigger] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Persist state
  useEffect(() => {
    localStorage.setItem('origins', JSON.stringify(origins));
    localStorage.setItem('destinations', JSON.stringify(destinations));
    localStorage.setItem('mode', mode);
  }, [origins, destinations, mode]);

  const addPoint = (type: 'origin' | 'destination') => {
    const newPoint = { id: generateId(), address: '', coords: null, loading: false };
    if (type === 'origin') {
      if (mode === 'one-to-many' && origins.length >= 1) return;
      setOrigins(prev => [...prev, newPoint]);
    } else {
      setDestinations(prev => [...prev, newPoint]);
    }
  };

  const removePoint = (id: string, type: 'origin' | 'destination') => {
    const isOrigin = type === 'origin';
    const list = isOrigin ? origins : destinations;
    const setList = isOrigin ? setOrigins : setDestinations;

    if (list.length > 1) {
      setList(prev => prev.filter(p => p.id !== id));
    } else {
      // If it's the last one, just reset it
      setList(prev => prev.map(p => p.id === id ? { ...p, address: '', coords: null } : p));
    }
  };

  const updatePoint = (id: string, value: string, type: 'origin' | 'destination') => {
    const updateFn = type === 'origin' ? setOrigins : setDestinations;
    updateFn(prev => prev.map(p => p.id === id ? { ...p, address: value, coords: null } : p));
  };

  const handleBlur = async (id: string, type: 'origin' | 'destination') => {
    const points = type === 'origin' ? origins : destinations;
    const point = points.find(p => p.id === id);

    if (!point || !point.address.trim()) return;

    // Set loading
    const setPoints = type === 'origin' ? setOrigins : setDestinations;
    setPoints(prev => prev.map(p => p.id === id ? { ...p, loading: true } : p));

    // Geocode
    const coords = await geocodeAddress(point.address);

    setPoints(prev => prev.map(p => p.id === id ? {
      ...p,
      loading: false,
      coords: coords ? { ...coords, lng: normalizeLng(coords.lng) } : null
    } : p));

    // Trigger auto-fit on successful geocode
    if (coords) setFitBoundsTrigger(prev => prev + 1);
  };

  const handleMapPointAdd = async (lat: number, lng: number, type: 'origin' | 'destination') => {
    const normLng = normalizeLng(lng);
    const isOrigin = type === 'origin';
    const setTargetList = isOrigin ? setOrigins : setDestinations;
    const currentList = isOrigin ? origins : destinations;

    // Determine Target ID
    let targetId = generateId();

    // 1. Check for empty slot
    const emptyIndex = currentList.findIndex(p => !p.address && !p.coords);
    if (emptyIndex !== -1) {
      targetId = currentList[emptyIndex].id;
    }
    // 2. Check mode (One-to-many Origin replacement)
    else if (mode === 'one-to-many' && isOrigin && currentList.length > 0) {
      targetId = currentList[0].id;
    }

    // Optimistic Point
    const tempPoint: LocationPoint = {
      id: targetId,
      address: 'Fetching address...',
      coords: { lat, lng: normLng },
      loading: true
    };

    // 1. Update State Synchronously (Optimistic)
    setTargetList(prev => {
      // We use the logic we already calculated BUT we must be careful if state changed. 
      // Ideally we trust 'currentList' matches 'prev'.
      // To be safe, we can just map/replace using targetId if it exists, or append if it doesn't.

      const exists = prev.some(p => p.id === targetId);

      if (exists) {
        return prev.map(p => p.id === targetId ? tempPoint : p);
      }
      return [...prev, tempPoint];
    });

    // Trigger auto-fit on map add
    setFitBoundsTrigger(prev => prev + 1);

    // 2. Resolve Address Asynchronously
    try {
      const address = await reverseGeocode(lat, normLng);
      // Fallback to lat/lng string if address is null/empty
      const finalAddress = address || `${lat.toFixed(6)}, ${normLng.toFixed(6)}`;

      setTargetList(prev => prev.map(p => p.id === targetId ? {
        ...p,
        address: finalAddress,
        coords: { lat, lng: normLng, name: finalAddress },
        loading: false
      } : p));

    } catch (e) {
      console.error("Geocoding failed", e);
      setTargetList(prev => prev.map(p => p.id === targetId ? {
        ...p,
        address: `${lat.toFixed(6)}, ${normLng.toFixed(6)}`,
        loading: false
      } : p));
    }
  };


  // Recalculate results when points change
  useEffect(() => {
    const calculateAllRoutes = async () => {
      const newResults: DistanceResult[] = [];

      if (mode === 'one-to-many') {
        // Use the first origin (should only be one)
        const origin = origins[0];
        if (origin && origin.coords) {
          // Use Promise.all to fetch routes in parallel
          const promises = destinations.map(async (dest) => {
            if (dest.coords) {
              const routeData = await calculateRoute(origin.coords!, dest.coords!);
              return {
                origin,
                destination: dest,
                ...routeData
              };
            }
            return null;
          });

          const resolved = await Promise.all(promises);
          resolved.forEach(r => { if (r) newResults.push(r); });
        }
      } else {
        // Many to Many: All Origins to All Destinations
        const promises: Promise<DistanceResult | null>[] = [];

        origins.forEach(origin => {
          if (origin.coords) {
            destinations.forEach(dest => {
              if (dest.coords) {
                promises.push(calculateRoute(origin.coords!, dest.coords!).then(routeData => ({
                  origin,
                  destination: dest,
                  ...routeData
                })));
              }
            });
          }
        });

        const resolved = await Promise.all(promises);
        resolved.forEach(r => { if (r) newResults.push(r); });
      }

      setResults(newResults);
    };

    calculateAllRoutes();
  }, [origins, destinations, mode]);

  // Handle Mode Switch Logic
  useEffect(() => {
    if (mode === 'one-to-many' && origins.length > 1) {
      // Keep only the first origin
      setOrigins(prev => [prev[0]]);
    }
  }, [mode]);

  const handlePointUpdate = async (id: string, lat: number, lng: number) => {
    const normLng = normalizeLng(lng);
    // Find which list the point belongs to
    const isOrigin = origins.some(p => p.id === id);
    const setList = isOrigin ? setOrigins : setDestinations;

    // Optimistic update
    setList(prev => prev.map(p => p.id === id ? {
      ...p,
      coords: { lat, lng: normLng },
      address: 'Updating location...',
      loading: true
    } : p));

    // Reverse Geocode
    try {
      const address = await reverseGeocode(lat, normLng);
      const finalAddress = address || `${lat.toFixed(6)}, ${normLng.toFixed(6)}`;

      setList(prev => prev.map(p => p.id === id ? {
        ...p,
        address: finalAddress,
        coords: { lat, lng: normLng, name: finalAddress },
        loading: false
      } : p));
    } catch (e) {
      setList(prev => prev.map(p => p.id === id ? {
        ...p,
        address: `${lat.toFixed(6)}, ${normLng.toFixed(6)}`,
        loading: false
      } : p));
    }
  };

  return (
    <div className="flex flex-col-reverse md:flex-row h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50 font-sans transition-colors duration-300">

      {/* Sidebar Container */}
      <div
        className={`${isSidebarOpen
          ? 'h-[50%] md:h-full w-full md:w-[400px]'
          : 'h-0 md:h-full w-full md:w-0'
          } relative flex flex-col border-t md:border-t-0 md:border-r border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/50 z-[500] shadow-2xl backdrop-blur-md transition-all duration-300 ease-in-out overflow-hidden shrink-0`}
      >
        <div className="flex-1 flex flex-col overflow-hidden w-full md:w-[400px]"> {/* Fixed width inner container to prevent layout shift during transition */}
          <Header />

          <div className="flex-1 overflow-hidden flex flex-col p-6 gap-6">
            <div className="flex-1 overflow-hidden">
              <InputPanel
                origins={origins}
                destinations={destinations}
                setOrigins={setOrigins}
                setDestinations={setDestinations}
                handleAddressChange={updatePoint}
                handleAddressBlur={handleBlur}
                addPoint={addPoint}
                removePoint={removePoint}
                mode={mode}
                setMode={setMode}
              />
            </div>

            <div className="h-[1px] bg-zinc-200 dark:bg-zinc-800 w-full"></div>

            <div className="h-1/3 min-h-[200px] overflow-hidden">
              <ResultsPanel results={results} />
            </div>
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative h-full">
        {/* Toggle Button - Floating on top of map */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute z-[510] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 rounded-lg shadow-md hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-all 
            md:top-1/2 md:left-0 md:-translate-y-1/2 md:border-l-0 md:rounded-l-none md:rounded-r-lg
            bottom-6 left-6 md:bottom-auto"
          title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isSidebarOpen ? (
            <>
              <PanelLeftClose size={18} className="hidden md:block" />
              <PanelLeftOpen size={18} className="md:hidden rotate-90" /> {/* Rotate for bottom sheet aesthetic */}
            </>
          ) : (
            <>
              <PanelLeftOpen size={18} className="hidden md:block" />
              <PanelLeftClose size={18} className="md:hidden rotate-90" />
            </>
          )}
        </button>

        <div className="absolute top-4 right-4 z-[400] bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-300 flex items-center gap-2 shadow-lg">
          <Calculator size={14} className="text-indigo-500 dark:text-indigo-400" />
          <span>{results.length} routes calculated</span>
        </div>
        <MapComponent
          origins={origins}
          destinations={destinations}
          results={results}
          onAddPoint={handleMapPointAdd}
          onUpdatePoint={handlePointUpdate}
          fitBoundsTrigger={fitBoundsTrigger}
        />
      </div>

      {showWelcome && <WelcomeScreen onStart={() => setShowWelcome(false)} />}

      <HelpButton />

    </div>
  );
}

export default App;
