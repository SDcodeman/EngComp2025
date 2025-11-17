Sewer Monitoring Dashboard
A React + Vite web application that visualizes real-time sewer camera data using simulated water-level and light-level telemetry. The dashboard includes a sortable camera list, animated water indicators, and an image-based sewer map built with React-Leaflet.

Features:
- Simulated sewer system with dynamic water + light levels
- Automatic data refresh every 5 seconds
- Interactive UI with camera list view, sewer map view, and theme toggle
- Side menu navigation
- Dark and light mode themes
- Fully client-side

Requirements:
- Node.js (v18 or newer)
- npm package manager
- Modern browser

Install Dependencies:
npm install

Leaflet CSS:
Leaflet CSS is already imported in main.jsx:
import 'leaflet/dist/leaflet.css';

Run Development Server:
npm run dev
Then open the local URL printed in the terminal.

Build for Production:
npm run build

Preview Production Build:
npm run preview

Project Structure:
src/
 ├── App.jsx
 ├── main.jsx
 ├── hooks/useCameraData.js
 ├── utils/datagen.js
 ├── components/
 │    ├── SewerList.jsx
 │    ├── SewerMap.jsx
 │    ├── Header.jsx
 │    ├── SideMenu.jsx
 │    └── WaterIndicator.js
 ├── assets/Map.png
 ├── index.css
 └── App.css

How the App Runs:
1. main.jsx mounts <App />
2. App.jsx sets routing, menu, theme
3. Components load depending on route
4. Data simulated via datagen.js
5. useCameraData refreshes values every 5 seconds
6. UI updates with animation and camera statuses

Common Issues:
- Ensure leaflet CSS is imported
- Run npm install if dependencies are missing
- Install MUI icons if icons fail to load: npm install @mui/icons-material

License:
MIT License
