import React, { useEffect, useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { LocationPoint, DistanceResult } from '../types';
import { useTheme } from '../hooks/useTheme';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons
const originIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const destIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface MapProps {
    origins: LocationPoint[];
    destinations: LocationPoint[];
    results: DistanceResult[];
    onAddPoint: (lat: number, lng: number, type: 'origin' | 'destination') => void;
    onUpdatePoint?: (id: string, lat: number, lng: number) => void;
}

const FitBounds: React.FC<{ points: LocationPoint[] }> = ({ points }) => {
    const map = useMap();

    useEffect(() => {
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
    }, [points, map]);

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
    icon: L.Icon;
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

const MapComponent: React.FC<MapProps> = ({ origins, destinations, results, onAddPoint, onUpdatePoint }) => {
    const { theme } = useTheme();
    const allPoints = [...origins, ...destinations];

    const lightTiles = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
    const darkTiles = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

    return (
        <MapContainer center={[20, 0] as [number, number]} zoom={2} className="h-full w-full bg-zinc-50 dark:bg-black transition-colors duration-300" style={{ background: 'transparent' }}>
            <TileLayer
                key={theme}
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url={theme === 'dark' ? darkTiles : lightTiles}
            />

            <FitBounds points={allPoints} />
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

            {results.map((res, i) => res.origin.coords && res.destination.coords && (
                <Polyline
                    key={i}
                    positions={[
                        [res.origin.coords.lat, res.origin.coords.lng],
                        [res.destination.coords.lat, res.destination.coords.lng]
                    ]}
                    pathOptions={{ color: '#6366f1', weight: 4, opacity: 0.8, dashArray: '10, 10' }}
                />
            ))}
        </MapContainer>
    );
};

export default MapComponent;
