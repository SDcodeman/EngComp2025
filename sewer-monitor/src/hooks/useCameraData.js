import { useState, useEffect } from 'react';
import { getCameraData, getAllCameraData } from '../utils/cameraData';
import { logCameraData, cleanupOldLogs } from '../utils/csvLogger';

/**
 * Custom hook to fetch and auto-refresh camera data every 5 seconds
 * Also logs data to IndexedDB for historical tracking
 * @param {boolean} includeAll - If true, fetch all locations; if false, fetch main 9 only
 * @returns Array of camera objects
 */
export function useCameraData(includeAll = false) {
  const [cameras, setCameras] = useState([]);

  useEffect(() => {
    // Fetch initial data
    const fetchData = async () => {
      const data = includeAll ? getAllCameraData() : getCameraData();
      setCameras(data);

      // Log the data to IndexedDB
      try {
        await logCameraData(data);
      } catch (error) {
        console.error('Failed to log camera data:', error);
      }
    };

    fetchData();

    // Set up interval to refresh every 5 seconds
    const interval = setInterval(fetchData, 5000);

    // Cleanup old logs once per hour
    const cleanupInterval = setInterval(async () => {
      try {
        const deletedCount = await cleanupOldLogs();
        if (deletedCount > 0) {
          console.log(`Cleaned up ${deletedCount} old log entries`);
        }
      } catch (error) {
        console.error('Failed to cleanup old logs:', error);
      }
    }, 60 * 60 * 1000); // Every hour

    // Cleanup intervals on unmount
    return () => {
      clearInterval(interval);
      clearInterval(cleanupInterval);
    };
  }, [includeAll]);

  return cameras;
}
