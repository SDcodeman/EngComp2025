import { MapContainer, ImageOverlay, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import mapImg from '../assets/Map.png';
import { useCameraData } from '../hooks/useCameraData';

// map width and height in pixels
const IMAGE_WIDTH = 1536;
const IMAGE_HEIGHT = 1024;

// Leaflet simple CRS bounds
const bounds = [
  [0, 0],
  [IMAGE_HEIGHT, IMAGE_WIDTH],
];

// Convert camera grid coordinates to map pixel coordinates
function coordinateToPixel(position) {
  // Assuming camera coordinates range from 0-3 on both axes
  // Map them to the image dimensions
  const x = (position[0] / 3) * IMAGE_WIDTH;
  const y = (position[1] / 3) * IMAGE_HEIGHT;
  return [y, x]; // Leaflet uses [lat, lng] which maps to [y, x]
}

// Get marker color based on status
function getStatusColor(status) {
  switch (status) {
    case 'OK':
      return '#4caf50'; // green
    case 'LOWLIGHT':
      return '#ff9800'; // orange
    case 'CRITICAL':
      return '#f44336'; // red
    default:
      return '#9e9e9e'; // grey
  }
}

export default function SewerMap() {
  const cameras = useCameraData();

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

          {/* Render camera markers */}
          {cameras.map((camera) => {
            const pixelPos = coordinateToPixel(camera.Position);
            return (
              <CircleMarker
                key={camera.SegmentID}
                center={pixelPos}
                radius={8}
                pathOptions={{
                  color: getStatusColor(camera.Status),
                  fillColor: getStatusColor(camera.Status),
                  fillOpacity: 0.8,
                  weight: 2,
                }}
              >
                <Popup>
                  <div>
                    <strong>Camera {camera.SegmentID}</strong>
                    <br />
                    <strong>Status:</strong> {camera.Status}
                    <br />
                    <strong>Position:</strong> [{camera.Position[0].toFixed(2)}, {camera.Position[1].toFixed(2)}]
                    <br />
                    <strong>Water:</strong> {(camera.Water * 100).toFixed(1)}%
                    <br />
                    <strong>Light:</strong> {((camera.Light / 255) * 100).toFixed(1)}%
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
