import { useState, useEffect } from 'react';
import { fetchCameras, getMockCameras } from '../services/api';
import { determineCameraStatus } from '../utils/cameraHelpers';

// Custom hook for managing camera data
export const useCameras = () => {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch cameras on mount
  useEffect(() => {
    loadCameras();
  }, []);

  const loadCameras = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch from API, fallback to mock data
      let data;
      try {
        data = await fetchCameras();
      } catch (apiError) {
        console.warn('API unavailable, using mock data');
        data = getMockCameras();
      }

      // Enrich camera data with computed status
      const enrichedCameras = data.map(camera => ({
        ...camera,
        status: determineCameraStatus(camera),
      }));

      setCameras(enrichedCameras);
    } catch (err) {
      setError(err.message || 'Failed to load cameras');
      console.error('Error loading cameras:', err);
    } finally {
      setLoading(false);
    }
  };

  // Refresh cameras
  const refreshCameras = () => {
    loadCameras();
  };

  // Get camera by ID
  const getCameraById = (id) => {
    return cameras.find(camera => camera.id === id);
  };

  // Filter cameras by status
  const getCamerasByStatus = (status) => {
    return cameras.filter(camera => camera.status === status);
  };

  return {
    cameras,
    loading,
    error,
    refreshCameras,
    getCameraById,
    getCamerasByStatus,
  };
};

export default useCameras;
