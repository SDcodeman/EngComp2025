import React, { useEffect } from 'react';
import {
  MapContainer,
  ImageOverlay,
  CircleMarker,
  Popup,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import mapImg from '../assets/Map.png';
import { useCameraData } from '../hooks/useCameraData';

// Map width and height in pixels (for this cropped map image)
const IMAGE_WIDTH = 1150;
const IMAGE_HEIGHT = 775;

// Leaflet simple CRS bounds: [ [top, left], [bottom, right] ]
const imageBounds = L.latLngBounds([0, 0], [IMAGE_HEIGHT, IMAGE_WIDTH]);

function MapInitializer() {
  const map = useMap();

  useEffect(() => {
    map.whenReady(() => {
      const center = [IMAGE_HEIGHT / 2, IMAGE_WIDTH / 2];

      // 1) Let Leaflet compute the zoom that exactly fits the image
      map.fitBounds(imageBounds, { animate: false });
      const fittedZoom = map.getZoom();

      // 2) Choose a slightly smaller zoom (zoomed OUT a bit)
      const defaultZoom = fittedZoom - 0.3; // tweak if you want more/less

      // 3) Smoothly fly to that view
      map.flyTo(center, defaultZoom, {
        animate: true,
        duration: 0.8, // seconds
      });

      // 4) Don't allow zooming out beyond this default view
      map.setMinZoom(defaultZoom);

      // 5) Prevent flying into empty space, but allow a small wiggle room
      map.setMaxBounds(imageBounds.pad(0.05));
    });
  }, [map]);

  return null;
}

// --- Your friend's calibration & marker logic (kept intact) ---

// Calibration points based on actual map measurements
// Grid (0,0) is at pixel (200 from left, 440 from top)
// Grid (1,1) is at pixel (375 from left, 590 from top)
const OFFSET_X = 434;
const OFFSET_Y = 192.5;
let SCALE_X = 149; // pixels per grid unit
let SCALE_Y = 180;   // pixels per grid unit

// Convert camera grid coordinates to map pixel coordinates
function coordinateToPixel(position) {
  if (position[1] > 1 && position[0] > 2) {
    SCALE_Y = 212.5;

  } else if (position[1] > 1) {
    SCALE_Y = 195;
  } else {
    SCALE_Y = 178.5;
  }

  if (position[0]<1.3) {
   SCALE_X = 149 // pixels per grid unit
  } else {
    SCALE_X = 148 // pixels per grid unit

  }

  const x = OFFSET_X + position[0] * SCALE_X;
  const y = IMAGE_HEIGHT - (OFFSET_Y + position[1] * SCALE_Y);
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
        <div className="map-frame">
          <div className="map-inner">
            <MapContainer
              crs={L.CRS.Simple}
              bounds={imageBounds}
              style={{ height: '100%', width: '100%' }}
              maxZoom={4}              // how far IN the user can zoom
              zoomControl={true}
              zoomAnimation={true}
              zoomAnimationThreshold={4}
            >
              {/* Background image */}
              <ImageOverlay url={mapImg} bounds={imageBounds} />

              {/* Smooth zoom / bounds logic */}
              <MapInitializer />

              {/* Render camera markers from your friend's data */}
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
                        <strong>Position:</strong> [
                        {camera.Position[0].toFixed(2)},{' '}
                        {camera.Position[1].toFixed(2)}]
                        <br />
                        <strong>Water:</strong>{' '}
                        {(camera.Water * 100).toFixed(1)}%
                        <br />
                        <strong>Light:</strong>{' '}
                        {((camera.Light / 255) * 100).toFixed(1)}%
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
