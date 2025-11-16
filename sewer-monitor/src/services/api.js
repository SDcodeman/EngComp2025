import axios from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fetch all cameras
export const fetchCameras = async () => {
  try {
    const response = await apiClient.get('/cameras');
    return response.data;
  } catch (error) {
    console.error('Error fetching cameras:', error);
    throw error;
  }
};

// Fetch single camera by ID
export const fetchCameraById = async (id) => {
  try {
    const response = await apiClient.get(`/cameras/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching camera ${id}:`, error);
    throw error;
  }
};

// Update camera status
export const updateCameraStatus = async (id, status) => {
  try {
    const response = await apiClient.patch(`/cameras/${id}`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating camera ${id}:`, error);
    throw error;
  }
};

// Mock data for development (remove when backend is ready)
export const getMockCameras = () => {
  return [
    {
      id: 1,
      name: 'Camera 1 - Main St',
      location: { lat: 40.7128, lng: -74.0060 },
      address: '123 Main St, New York, NY',
      active: true,
      lastUpdate: new Date().toISOString(),
      errors: [],
      warnings: [],
    },
    {
      id: 2,
      name: 'Camera 2 - Broadway',
      location: { lat: 40.7580, lng: -73.9855 },
      address: '456 Broadway, New York, NY',
      active: true,
      lastUpdate: new Date(Date.now() - 3600000).toISOString(),
      errors: [],
      warnings: ['Low battery'],
    },
    {
      id: 3,
      name: 'Camera 3 - Park Ave',
      location: { lat: 40.7489, lng: -73.9680 },
      address: '789 Park Ave, New York, NY',
      active: true,
      lastUpdate: new Date(Date.now() - 7200000).toISOString(),
      errors: ['Connection lost'],
      warnings: [],
    },
    {
      id: 4,
      name: 'Camera 4 - 5th Ave',
      location: { lat: 40.7614, lng: -73.9776 },
      address: '321 5th Ave, New York, NY',
      active: false,
      lastUpdate: new Date(Date.now() - 86400000).toISOString(),
      errors: [],
      warnings: [],
    },
  ];
};
