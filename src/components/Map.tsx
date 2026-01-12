import React, { useEffect, useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { LocationPoint, DistanceResult } from '../types';
import { useTheme } from '../hooks/useTheme';

// Custom icons using DivIcon for robustness
const originIcon = new L.DivIcon({
    className: 'bg-transparent',
    html: `<div class="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white shadow-lg shadow-black/20 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
             <div class="w-2 h-2 rounded-full bg-white"></div>
           </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
});

const destIcon = new L.DivIcon({
    className: 'bg-transparent',
    html: `<div class="w-6 h-6 rounded-full bg-rose-500 border-2 border-white shadow-lg shadow-black/20 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
             <div class="w-2 h-2 rounded-full bg-white"></div>
           </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
});

interface MapProps {
    origins: LocationPoint[];
    destinations: LocationPoint[];
    results: DistanceResult[];
    onAddPoint: (lat: number, lng: number, type: 'origin' | 'destination') => void;
    onUpdatePoint?: (id: string, lat: number, lng: number) => void;
    fitBoundsTrigger: number;
}

interface FitBoundsProps {
    points: LocationPoint[];
    trigger: number;
}

const FitBounds: React.FC<FitBoundsProps> = ({ points, trigger }) => {
    const map = useMap();

    useEffect(() => {
        if (trigger === 0) return; // Initial skip or no action

        const validPoints = points
            .filter(p => p.coords)
            .map(p => [p.coords!.lat, p.coords!.lng] as [number, number]);

        if (validPoints.length > 0) {
            const bounds = L.latLngBounds(validPoints);
            // Use flyToBounds for smoother animation
            map.flyToBounds(bounds, {
                padding: [50, 50],
                maxZoom: 12, // Limit zoom level to avoid disorientation
                duration: 1.5 // Slower animation (seconds)
            });
        }
    }, [trigger, map]); // Only run when trigger changes

    return null;
};

// Component to handle map clicks and context menu
const MapInteraction: React.FC<{ onAddPoint: (lat: number, lng: number, type: 'origin' | 'destination') => void }> = ({ onAddPoint }) => {
    const [menuPosition, setMenuPosition] = useState<{ x: number, y: number, lat: number, lng: number } | null>(null);

    useMapEvents({
        contextmenu(e) {
            e.originalEvent.preventDefault();
            // Ensure we capture client coordinates correctly relative to viewport
            setMenuPosition({
                x: e.originalEvent.clientX,
                y: e.originalEvent.clientY,
                lat: e.latlng.lat,
                lng: e.latlng.lng
            });
        },
        click() {
            setMenuPosition(null);
        },
        dragstart() {
            setMenuPosition(null);
        },
        zoomstart() {
            setMenuPosition(null);
        }
    });

    // Close menu on click elsewhere
    useEffect(() => {
        const handleClick = () => setMenuPosition(null);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    if (!menuPosition) return null;

    return (
        <div
            className="fixed z-[9999] bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl overflow-hidden py-1 min-w-[160px] animate-in fade-in zoom-in-95 duration-100"
            style={{ left: menuPosition.x, top: menuPosition.y }}
            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onMouseDown={(e) => { e.stopPropagation(); }} // Block map drag/interaction
            onPointerDown={(e) => { e.stopPropagation(); }} // Block leaflet pointer events
            onClick={(e) => { e.stopPropagation(); }} // Block outside click listener
            onDoubleClick={(e) => { e.stopPropagation(); }}
            onWheel={(e) => { e.stopPropagation(); }}
        >
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-700/50 mb-1 bg-zinc-800/50">
                Add Location
            </div>
            <button
                className="w-full text-left px-3 py-2 text-sm text-emerald-400 hover:bg-zinc-700/50 transition-colors flex items-center gap-2 cursor-pointer relative z-[10000]"
                onMouseDown={(e) => {
                    // Use onMouseDown for immediate action, bypassing click complexity on maps
                    e.preventDefault();
                    e.stopPropagation();
                    onAddPoint(menuPosition.lat, menuPosition.lng, 'origin');
                    setMenuPosition(null);
                }}
            >
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
                Set as Origin
            </button>
            <button
                className="w-full text-left px-3 py-2 text-sm text-rose-400 hover:bg-zinc-700/50 transition-colors flex items-center gap-2 cursor-pointer relative z-[10000]"
                onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onAddPoint(menuPosition.lat, menuPosition.lng, 'destination');
                    setMenuPosition(null);
                }}
            >
                <span className="w-2 h-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></span>
                Set as Destination
            </button>
        </div>
    );
};

interface DraggableMarkerProps {
    point: LocationPoint;
    icon: L.Icon | L.DivIcon;
    onUpdate: (id: string, lat: number, lng: number) => void;
}

const DraggableMarker: React.FC<DraggableMarkerProps> = ({ point, icon, onUpdate }) => {
    const markerRef = useRef<L.Marker>(null);

    const eventHandlers = useMemo(() => ({
        dragend() {
            const marker = markerRef.current;
            if (marker != null) {
                const { lat, lng } = marker.getLatLng();
                onUpdate(point.id, lat, lng);
            }
        },
    }), [onUpdate, point.id]);

    if (!point.coords) return null;

    return (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={[point.coords.lat, point.coords.lng]}
            icon={icon}
            ref={markerRef}
        >
            <Popup className="font-sans text-xs font-medium text-zinc-800">
                {point.address || "Drag to move"}
            </Popup>
        </Marker>
    );
};

// Component to save map view to localStorage
const MapEvents: React.FC = () => {
    const map = useMap();

    useMapEvents({
        moveend: () => {
            const center = map.getCenter();
            const zoom = map.getZoom();
            localStorage.setItem('map_view', JSON.stringify({ center: [center.lat, center.lng], zoom }));
        },
        zoomend: () => {
            const center = map.getCenter();
            const zoom = map.getZoom();
            localStorage.setItem('map_view', JSON.stringify({ center: [center.lat, center.lng], zoom }));
        }
    });

    return null;
};

const MapComponent: React.FC<MapProps> = ({ origins, destinations, results, onAddPoint, onUpdatePoint, fitBoundsTrigger }) => {
    const { theme } = useTheme();
    const allPoints = [...origins, ...destinations];

    const lightTiles = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
    const darkTiles = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

    // Initialize from localStorage
    const savedView = useMemo(() => {
        try {
            const saved = localStorage.getItem('map_view');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.error("Failed to parse map view", e);
        }
        return { center: [20, 0], zoom: 2 };
    }, []);

    return (
        <MapContainer
            center={savedView.center}
            zoom={savedView.zoom}
            minZoom={2}
            maxBounds={[[-90, -180], [90, 180]]}
            maxBoundsViscosity={1.0}
            className="h-full w-full bg-zinc-50 dark:bg-black transition-colors duration-300"
            style={{ background: 'transparent' }}
        >
            <TileLayer
                key={theme}
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url={theme === 'dark' ? darkTiles : lightTiles}
            />

            <FitBounds points={allPoints} trigger={fitBoundsTrigger} />
            <MapEvents />
            <MapInteraction onAddPoint={onAddPoint} />

            {origins.map(point => (
                <DraggableMarker
                    key={point.id}
                    point={point}
                    icon={originIcon}
                    onUpdate={onUpdatePoint!}
                />
            ))}

            {destinations.map(point => (
                <DraggableMarker
                    key={point.id}
                    point={point}
                    icon={destIcon}
                    onUpdate={onUpdatePoint!}
                />
            ))}

            {results.map((res, i) => {
                if (!res.origin.coords || !res.destination.coords) return null;

                const positions = res.path ? res.path : [
                    [res.origin.coords.lat, res.origin.coords.lng],
                    [res.destination.coords.lat, res.destination.coords.lng]
                ] as [number, number][];

                return (
                    <React.Fragment key={`${res.origin.id}-${res.destination.id}-${i}`}>
                        <Polyline
                            positions={positions}
                            pathOptions={{
                                color: res.isRoad ? '#6366f1' : '#f43f5e',
                                weight: 4,
                                opacity: 0.8,
                                dashArray: res.isRoad ? undefined : '10, 10'
                            }}
                        />
                        {!res.isRoad && res.errorReason && (
                            <Popup position={res.origin.coords}>
                                <div className="text-xs text-rose-500">
                                    Routing Failed: {res.errorReason}
                                </div>
                            </Popup>
                        )}
                    </React.Fragment>
                );
            })}
        </MapContainer>
    );
};

export default MapComponent;
