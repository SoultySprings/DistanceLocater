export interface LocationPoint {
    id: string;
    address: string;
    coords: { lat: number; lng: number } | null;
    loading: boolean;
    error?: string;
}

export interface DistanceResult {
    origin: LocationPoint;
    destination: LocationPoint;
    distance: number;
    path?: [number, number][];
    isRoad?: boolean;
    errorReason?: string;
}
