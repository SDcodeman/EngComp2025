// Camera status constants
export const CAMERA_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  WARNING: 'warning',
  ERROR: 'error',
};

// Get status color based on camera state
export const getStatusColor = (status) => {
  switch (status) {
    case CAMERA_STATUS.ONLINE:
      return '#4caf50'; // Green
    case CAMERA_STATUS.WARNING:
      return '#ff9800'; // Orange
    case CAMERA_STATUS.ERROR:
      return '#f44336'; // Red
    case CAMERA_STATUS.OFFLINE:
    default:
      return '#9e9e9e'; // Gray
  }
};

// Get status label
export const getStatusLabel = (status) => {
  switch (status) {
    case CAMERA_STATUS.ONLINE:
      return 'Online';
    case CAMERA_STATUS.WARNING:
      return 'Warning';
    case CAMERA_STATUS.ERROR:
      return 'Error';
    case CAMERA_STATUS.OFFLINE:
    default:
      return 'Offline';
  }
};

// Determine camera status based on data
export const determineCameraStatus = (camera) => {
  if (!camera.active) return CAMERA_STATUS.OFFLINE;
  if (camera.errors && camera.errors.length > 0) return CAMERA_STATUS.ERROR;
  if (camera.warnings && camera.warnings.length > 0) return CAMERA_STATUS.WARNING;
  return CAMERA_STATUS.ONLINE;
};

// Format timestamp
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp);
  return date.toLocaleString();
};

// Get marker icon for map based on status
export const getMarkerIcon = (status) => {
  const color = getStatusColor(status);
  return `<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 0C6.716 0 0 6.716 0 15c0 8.284 15 25 15 25s15-16.716 15-25c0-8.284-6.716-15-15-15z" fill="${color}"/>
    <circle cx="15" cy="15" r="6" fill="white"/>
  </svg>`;
};
