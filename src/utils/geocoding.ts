import { type Coordinates, normalizeLng } from './distanceCalculator';

export const geocodeAddress = async (address: string): Promise<Coordinates | null> => {
    try {
        // Check if input is coordinates (lat, lng)
        const coordRegex = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
        const match = address.trim().match(coordRegex);
        if (match) {
            return {
                lat: parseFloat(match[1]),
                lng: parseFloat(match[3]),
                name: address
            };
        }

        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
        );
        const data = await response.json();
        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
                name: data[0].display_name,
            };
        }
        return null;
    } catch (error) {
        console.error("Geocoding error:", error);
        return null;
    }
};

export const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
    try {
        // Normalize longitude to -180 to +180
        const normalizedLng = normalizeLng(lng);

        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${normalizedLng}`
        );
        const data = await response.json();

        if (data && data.error) {
            console.warn("Nominatim error:", data.error);
            return null;
        }

        if (data && data.display_name) {
            return data.display_name;
        }
        return `${lat.toFixed(6)}, ${normalizedLng.toFixed(6)}`;
    } catch (error) {
        console.error("Reverse geocoding error:", error);
        // Return original coords if failure, or normalized? Normalized is better for display.
        const normalizedLng = normalizeLng(lng);
        return `${lat.toFixed(6)}, ${normalizedLng.toFixed(6)}`;
    }
};
