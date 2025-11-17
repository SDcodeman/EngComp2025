import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  Tooltip,
  TableSortLabel,
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';
import { useCameraData } from '../hooks/useCameraData';
import CameraLogSidebar from './CameraLogSidebar';

const WaterLevelIndicator = ({ waterLevel, brightness }) => {
  // Convert brightness (0-255) to darkness percentage (0-100)
  const darknessPercent = 100 - (brightness / 255) * 100;
  
  // Calculate RGB for darkness (darker = more black)
  const darknessValue = Math.round(255 - (darknessPercent / 100) * 255);
  const backgroundColor = `rgb(${darknessValue}, ${darknessValue}, ${darknessValue})`;
  
  // Water level as percentage from bottom
  const waterPercent = waterLevel * 100;

  return (
    <Box
      sx={{
        width: 80,
        height: 80,
        position: 'relative',
        borderRadius: '50%',
        border: '3px solid white',
        outline: '3px solid #2196f3',
        overflow: 'hidden',
        backgroundColor: backgroundColor,
      }}
    >
      {/* Water with wave animation */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: `${waterPercent}%`,
          backgroundColor: '#2196f3',
          transition: 'height 0.3s ease',
          overflow: 'hidden',
        }}
      >
        {/* Animated wave layers */}
        <Box
          sx={{
            position: 'absolute',
            top: '-10px',
            left: '-50%',
            width: '200%',
            height: '20px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '45%',
            animation: 'wave1 3s ease-in-out infinite',
            '@keyframes wave1': {
              '0%, 100%': {
                transform: 'translateX(0) translateY(0)',
              },
              '50%': {
                transform: 'translateX(-25%) translateY(-5px)',
              },
            },
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '-15px',
            left: '-50%',
            width: '200%',
            height: '25px',
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '40%',
            animation: 'wave2 4s ease-in-out infinite',
            animationDelay: '-1s',
            '@keyframes wave2': {
              '0%, 100%': {
                transform: 'translateX(-25%) translateY(0)',
              },
              '50%': {
                transform: 'translateX(0) translateY(-8px)',
              },
            },
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '-5px',
            left: '-50%',
            width: '200%',
            height: '15px',
            background: 'rgba(33, 150, 243, 0.3)',
            borderRadius: '50%',
            animation: 'wave3 3.5s ease-in-out infinite',
            animationDelay: '-0.5s',
            '@keyframes wave3': {
              '0%, 100%': {
                transform: 'translateX(-12.5%) translateY(-3px)',
              },
              '50%': {
                transform: 'translateX(-37.5%) translateY(0)',
              },
            },
          }}
        />
      </Box>
      
      {/* Percentage text overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: waterPercent > 50 ? 'white' : darknessValue < 128 ? 'white' : 'black',
          fontWeight: 'bold',
          fontSize: '10px',
          textShadow: '0 0 3px rgba(0,0,0,0.5)',
          zIndex: 10,
        }}
      >
        {waterPercent.toFixed(0)}%
      </Box>
    </Box>
  );
};

const CameraList = () => {
  const cameras = useCameraData();
  const [orderBy, setOrderBy] = useState('SegmentID');
  const [order, setOrder] = useState('asc');
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Handle camera row click
  const handleCameraClick = (camera) => {
    setSelectedCamera(camera);
    setSidebarOpen(true);
  };

  // Handle sidebar close
  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  // Determine status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'OK':
        return 'success';
      case 'LOWLIGHT':
        return 'warning';
      case 'WARNING':
        return 'error';
      default:
        return 'default';
    }
  };

  // Check if water level requires warning
  const hasWaterWarning = (water) => water > 0.8 || water < 0.2;

  // Get water warning message
  const getWaterWarningMessage = (water) => {
    if (water > 0.8) {
      return `High water level: ${(water * 100).toFixed(1)}%`;
    }
    if (water < 0.2) {
      return `Low water level: ${(water * 100).toFixed(1)}%`;
    }
    return '';
  };

  // Handle sort request
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Sort cameras
  const sortedCameras = useMemo(() => {
    return [...cameras].sort((a, b) => {
      let aValue, bValue;

      switch (orderBy) {
        case 'SegmentID':
          aValue = a.SegmentID;
          bValue = b.SegmentID;
          break;
        case 'Water':
          aValue = a.Water;
          bValue = b.Water;
          break;
        case 'Status':
          aValue = a.Status;
          bValue = b.Status;
          break;
        case 'Light':
          aValue = a.Light;
          bValue = b.Light;
          break;
        case 'Alert':
          // Sort by alert: items with warnings first
          aValue = hasWaterWarning(a.Water) ? 0 : 1;
          bValue = hasWaterWarning(b.Water) ? 0 : 1;
          break;
        default:
          return 0;
      }

      if (order === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [cameras, order, orderBy]);

  return (
    <Box
      sx={{
        width: '75%',
        margin: '0 auto',
        mt: 3,
      }}
    >
      <TableContainer 
        component={Paper} 
        sx={{ 
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'Status'}
                  direction={orderBy === 'Status' ? order : 'asc'}
                  onClick={() => handleRequestSort('Status')}
                >
                  <strong>Status</strong>
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'SegmentID'}
                  direction={orderBy === 'SegmentID' ? order : 'asc'}
                  onClick={() => handleRequestSort('SegmentID')}
                >
                  <strong>ID</strong>
                </TableSortLabel>
              </TableCell>
              <TableCell><strong>Position</strong></TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'Water'}
                  direction={orderBy === 'Water' ? order : 'asc'}
                  onClick={() => handleRequestSort('Water')}
                >
                  <strong>Water Level</strong>
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'Light'}
                  direction={orderBy === 'Light' ? order : 'asc'}
                  onClick={() => handleRequestSort('Light')}
                >
                  <strong>Brightness</strong>
                </TableSortLabel>
              </TableCell>
              <TableCell><strong>Visual</strong></TableCell>
              <TableCell align="center">
                <TableSortLabel
                  active={orderBy === 'Alert'}
                  direction={orderBy === 'Alert' ? order : 'asc'}
                  onClick={() => handleRequestSort('Alert')}
                >
                  <strong>Alert</strong>
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedCameras.map((camera) => (
              <TableRow
                key={camera.SegmentID}
                onClick={() => handleCameraClick(camera)}
                sx={{
                  '&:hover': { bgcolor: 'grey.50', cursor: 'pointer' },
                  transition: 'background-color 0.2s',
                }}
              >
                <TableCell>
                  <Chip
                    label={camera.Status}
                    color={getStatusColor(camera.Status)}
                    size="small"
                    sx={{ minWidth: 90 }}
                  />
                </TableCell>
                <TableCell sx={{ color: '#424242' }}>
                  {camera.SegmentID}
                </TableCell>
                <TableCell sx={{ color: '#424242' }}>
                  Lon: {camera.Position[0].toFixed(4)}<br />
                  Lat: {camera.Position[1].toFixed(4)}
                </TableCell>
                <TableCell sx={{ color: '#424242' }}>
                  {(camera.Water * 100).toFixed(1)}%
                </TableCell>
                <TableCell sx={{ color: '#424242' }}>
                  {((camera.Light / 255) * 100).toFixed(1)}%
                </TableCell>
                <TableCell>
                  <WaterLevelIndicator 
                    waterLevel={camera.Water} 
                    brightness={camera.Light}
                  />
                </TableCell>
                <TableCell align="center">
                  {hasWaterWarning(camera.Water) && (
                    <Tooltip title={getWaterWarningMessage(camera.Water)} arrow>
                      <WarningIcon color="error" sx={{ cursor: 'help' }} />
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Sidebar for camera logs */}
      <CameraLogSidebar
        open={sidebarOpen}
        onClose={handleSidebarClose}
        camera={selectedCamera}
      />
    </Box>
  );
};

export default CameraList;