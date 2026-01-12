# Odyssey - Distance Locator

A premium, interactive web application designed to calculate distances between multiple locations with precision and style. Features a modern, "Prody"-inspired UI with a "Black Spectrum" dark mode.

![Project Screenshot](https://via.placeholder.com/800x450.png?text=Odyssey+App+Preview)

## Features

*   **Interactive Global Map**: Built with Leaflet & OpenStreetMap, now with **Smart-locked World View** to prevent coordinate issues.
*   **Robust Routing**: Powered by OSRM with automatic coordinate normalization and fallback strategies.
*   **Smart Geocoding**: Automatically converts addresses to coordinates and vice-versa using the Nominatim API.
*   **Drag-and-Drop Interaction**:
    *   Right-click anywhere to add Origins or Destinations.
    *   Drag markers to instantly recalculate routes.
    *   Robust "DivIcon" markers for high visibility.
*   **Flexible Routing Modes**:
    *   **One-to-Many**: Calculate distances from a central hub to multiple destinations.
    *   **Many-to-Many**: Compute a full matrix of distances between multiple origins and destinations.
*   **Premium Aesthetic**:
    *   Clean, card-based interface with "Zinc" neutral gray palette.
    *   Fully responsive "Black Spectrum" Dark Mode.
    *   Glassmorphism effects and smooth transitions.
*   **Data Persistence**: Automatically saves your locations and preferences locally.

## Tech Stack

*   **Framework**: React + Vite
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **Map Engine**: Leaflet / React-Leaflet
*   **Icons**: Lucide React
*   **Animation**: Framer Motion

## Getting Started

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Run Development Server**
    ```bash
    npm run dev
    ```

3.  **Build**
    ```bash
    npm run build
    ```

## License

MIT
