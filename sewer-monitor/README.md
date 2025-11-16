# Sewer Monitor - Hackathon Project

A real-time sewer camera monitoring system built with React, Material-UI, and Leaflet.

## Tech Stack

- **Frontend Framework**: React with Vite
- **UI Library**: Material-UI (MUI)
- **Map Library**: Leaflet + react-leaflet (no API key needed)
- **Routing**: React Router
- **HTTP Client**: Axios

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update the API URL in `.env` if needed:

```
VITE_API_BASE_URL=http://localhost:3000/api
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

## Project Structure

```
sewer-monitor/
├── src/
│   ├── components/
│   │   ├── layout/          # Header and Layout components
│   │   ├── camera/          # Camera card, list, and status components
│   │   └── map/             # Map view and marker components
│   ├── services/
│   │   └── api.js           # API calls and mock data
│   ├── hooks/
│   │   └── useCameras.js    # Custom hook for camera data
│   ├── utils/
│   │   └── cameraHelpers.js # Status logic and helpers
│   ├── views/
│   │   ├── ListView.jsx     # List view page
│   │   └── MapView.jsx      # Map view page
│   ├── App.jsx              # Main app with routing
│   └── main.jsx             # Entry point
└── public/
    └── assets/              # Static assets
```

## Features

- **List View**: Grid display of all cameras with status indicators
- **Map View**: Interactive map showing camera locations
- **Status Tracking**: Real-time camera status (Online, Warning, Error, Offline)
- **Mock Data**: Built-in mock data for development
- **Responsive Design**: Mobile-friendly layout
- **Theming**: Water/infrastructure themed color scheme

## Mock Data

The app includes mock camera data in `src/services/api.js`. The API automatically falls back to mock data if the backend is unavailable.

## Customization

### Change Theme Colors

Edit `src/App.jsx` to modify the theme:

```javascript
const theme = createTheme({
  palette: {
    primary: { main: '#0277bd' },
    secondary: { main: '#00897b' },
  },
});
```

### Add New Camera Fields

1. Update mock data in `src/services/api.js`
2. Modify `CameraCard.jsx` to display new fields
3. Update `MapPopup.jsx` for map markers

## Development Tips

- Keep components simple and focused
- Use Material-UI's responsive Grid system
- Test both list and map views
- Ensure mobile responsiveness
- Use the mock data during development

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Browser Support

Modern browsers with ES6 support (Chrome, Firefox, Safari, Edge)
