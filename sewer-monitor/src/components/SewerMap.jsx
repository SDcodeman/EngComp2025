import { MapContainer, ImageOverlay } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import mapImg from '../assets/Map.png';

// map width and height in pixels
const IMAGE_WIDTH = 1536;
const IMAGE_HEIGHT = 1024;

// Leaflet simple CRS bounds
const bounds = [
  [0, 0],
  [IMAGE_HEIGHT, IMAGE_WIDTH],
];

export default function SewerMap() {
  return (
    <div className="map-page">
      <h1>Sewer Map</h1>

      <div className="map-container">
        <MapContainer
          crs={L.CRS.Simple}
          bounds={bounds}
          style={{ height: '80vh', width: '100%' }}
          minZoom={-1}
          maxZoom={2}
        >
          <ImageOverlay url={mapImg} bounds={bounds} />
        </MapContainer>
      </div>
    </div>
  );
}
