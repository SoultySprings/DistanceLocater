export interface Coordinates {
    lat: number;
    lng: number;
    name?: string;
}

export const calculateDirectDistance = (coord1: Coordinates, coord2: Coordinates): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(coord2.lat - coord1.lat);
    const dLon = deg2rad(coord2.lng - coord1.lng);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(coord1.lat)) * Math.cos(deg2rad(coord2.lat)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return parseFloat(d.toFixed(2));
};

export const normalizeLng = (lng: number): number => {
    return ((lng + 180) % 360 + 360) % 360 - 180;
};

const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
};

// Helper to delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const ROUTING_ENDPOINTS = [
    '/api/routing', // Use local proxy to bypass CORS/Network issues
    'https://routing.openstreetmap.de/routed-car/route/v1/driving',
    'https://router.project-osrm.org/route/v1/driving'
];

export const calculateRoute = async (coord1: Coordinates, coord2: Coordinates): Promise<{ distance: number; path: [number, number][]; isRoad: boolean; errorReason?: string }> => {
    // Validate coordinates
    if (typeof coord1.lat !== 'number' || isNaN(coord1.lat) ||
        typeof coord1.lng !== 'number' || isNaN(coord1.lng) ||
        typeof coord2.lat !== 'number' || isNaN(coord2.lat) ||
        typeof coord2.lng !== 'number' || isNaN(coord2.lng)) {

        console.error("Invalid/NaN coordinates:", coord1, coord2);
        return {
            distance: calculateDirectDistance(coord1, coord2),
            path: [[coord1.lat, coord1.lng], [coord2.lat, coord2.lng]],
            isRoad: false,
            errorReason: "Invalid Coordinates (NaN)"
        };
    }

    // Normalize Coordinates for API (Handle world wrapping)
    const c1 = { ...coord1, lng: normalizeLng(coord1.lng) };
    const c2 = { ...coord2, lng: normalizeLng(coord2.lng) };

    // Try each endpoint
    let lastError = "No Attempts";

    for (const baseUrl of ROUTING_ENDPOINTS) {
        const result = await tryFetchRoute(baseUrl, c1, c2);
        if (result.success && result.data) return result.data;
        if (result.error) lastError = result.error;
    }

    console.warn("All routing attempts failed.", lastError);

    // Fallback to direct distance
    const directDist = calculateDirectDistance(coord1, coord2);
    return {
        distance: directDist,
        path: [[coord1.lat, coord1.lng], [coord2.lat, coord2.lng]],
        isRoad: false,
        errorReason: lastError
    };
};

const tryFetchRoute = async (baseUrl: string, coord1: Coordinates, coord2: Coordinates): Promise<{ success: boolean; data?: any; error?: string }> => {
    const MAX_RETRIES = 2;
    let attempt = 0;
    let lastErr = "";

    while (attempt < MAX_RETRIES) {
        try {
            const url = `${baseUrl}/${coord1.lng},${coord1.lat};${coord2.lng},${coord2.lat}?overview=full&geometries=geojson`;
            const response = await fetch(url);

            if (response.status === 429) {
                console.warn(`Endpoint ${baseUrl} Rate Limited (429).`);
                await delay(1000 * (attempt + 1));
                attempt++;
                lastErr = "429 Rate Limit";
                continue;
            }

            if (!response.ok) {
                console.error(`Fetch failed for URL: ${url} | Status: ${response.status}`);
                lastErr = `Status ${response.status}`;
                // If 404, the path is wrong. If 500, server error.
                if (response.status >= 400 && response.status < 500 && response.status !== 429) {
                    return { success: false, error: `${baseUrl}: ${response.status}` };
                }
                break;
            }

            const data = await response.json();

            if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                const distanceKm = route.distance / 1000;

                const path = route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number]);

                return {
                    success: true,
                    data: {
                        distance: parseFloat(distanceKm.toFixed(2)),
                        path,
                        isRoad: true
                    }
                };
            }

            if (data.code === 'NoRoute') return { success: false, error: "NoRoute" };

            lastErr = `API Code: ${data.code}`;
            break;

        } catch (error: any) {
            console.warn(`Fetch failed for ${baseUrl}:`, error);
            lastErr = error.message || "Network Error";
            attempt++;
            if (attempt < MAX_RETRIES) await delay(500);
        }
    }
    return { success: false, error: lastErr };
};
