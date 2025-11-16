import { useState, useEffect } from 'react';
import { getCameraData } from '../utils/cameraData';

/**
 * Custom hook to fetch and auto-refresh camera data every 5 seconds
 * @returns Array of camera objects
 */
export function useCameraData() {
  const [cameras, setCameras] = useState([]);

  useEffect(() => {
    // Fetch initial data
    const fetchData = () => {
      const data = getCameraData();
      setCameras(data);
    };

    fetchData();

    // Set up interval to refresh every 5 seconds
    const interval = setInterval(fetchData, 5000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  return cameras;
}
