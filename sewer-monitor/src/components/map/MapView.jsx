import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import CameraMarker from './CameraMarker';
import 'leaflet/dist/leaflet.css';

// Component to fit bounds to all markers
function FitBounds({ cameras }) {
  const map = useMap();

  useEffect(() => {
    if (cameras && cameras.length > 0) {
      const bounds = cameras.map(camera => [camera.location.lat, camera.location.lng]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [cameras, map]);

  return null;
}

function MapView({ cameras }) {
  // Default center (New York City)
  const defaultCenter = [40.7128, -74.0060];
  const defaultZoom = 12;

  return (
    <MapContainer
      center={defaultCenter}
      zoom={defaultZoom}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {cameras && cameras.map((camera) => (
        <CameraMarker key={camera.id} camera={camera} />
      ))}

      <FitBounds cameras={cameras} />
    </MapContainer>
  );
}

export default MapView;
