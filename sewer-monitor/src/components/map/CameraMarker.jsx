import { Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { renderToString } from 'react-dom/server';
import MapPopup from './MapPopup';
import { getStatusColor } from '../../utils/cameraHelpers';

function CameraMarker({ camera }) {
  const { location } = camera;
  const color = getStatusColor(camera.status);

  // Create custom icon with status color
  const customIcon = new Icon({
    iconUrl: `data:image/svg+xml,${encodeURIComponent(`
      <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 0C6.716 0 0 6.716 0 15c0 8.284 15 25 15 25s15-16.716 15-25c0-8.284-6.716-15-15-15z" fill="${color}"/>
        <circle cx="15" cy="15" r="6" fill="white"/>
      </svg>
    `)}`,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -40],
  });

  return (
    <Marker position={[location.lat, location.lng]} icon={customIcon}>
      <Popup>
        <MapPopup camera={camera} />
      </Popup>
    </Marker>
  );
}

export default CameraMarker;
