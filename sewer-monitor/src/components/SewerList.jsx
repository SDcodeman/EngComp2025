import React, { useState } from 'react';
import {
  List,
  ListItemButton,
  Collapse,
  Box,
  Typography,
  Chip,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useCameraData } from '../hooks/useCameraData';

const CameraListItem = ({ camera }) => {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(!open);
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
  const hasWaterWarning = camera.Water > 0.8 || camera.Water < 0.2;
  
  // Get water warning message
  const getWaterWarningMessage = () => {
    if (camera.Water > 0.8) {
      return `High water level: ${(camera.Water * 100).toFixed(1)}%`;
    }
    if (camera.Water < 0.2) {
      return `Low water level: ${(camera.Water * 100).toFixed(1)}%`;
    }
    return '';
  };

  return (
    <>
      <ListItemButton onClick={handleClick}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            gap: 2,
          }}
        >
          {/* Status Indicator */}
          <Chip
            label={camera.Status}
            color={getStatusColor(camera.Status)}
            size="small"
            sx={{ minWidth: 90 }}
          />

          {/* Segment ID */}
          <Typography 
            variant="body1" 
            sx={{ 
              minWidth: 80,
              color: '#424242' // Darker gray
            }}
          >
            ID: {camera.SegmentID}
          </Typography>

          {/* Position (Longitude, Latitude) */}
          <Typography 
            variant="body2" 
            sx={{ 
              flexGrow: 1,
              color: '#424242' // Darker gray
            }}
          >
            Lon: {camera.Position[0].toFixed(4)}, Lat: {camera.Position[1].toFixed(4)}
          </Typography>

          {/* Water Warning Icon with Tooltip */}
          {hasWaterWarning && (
            <Tooltip title={getWaterWarningMessage()} arrow>
              <WarningIcon color="error" sx={{ mr: 1, cursor: 'help' }} />
            </Tooltip>
          )}

          {/* Expand Icon */}
          {open ? <ExpandLess /> : <ExpandMore />}
        </Box>
      </ListItemButton>

      {/* Expanded Content */}
      <Collapse in={open} timeout="auto" unmountOnExit>
        <Box sx={{ pl: 4, pr: 2, py: 2, bgcolor: 'background.default' }}>
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
            {/* Left side - Text information */}
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="body2" 
                gutterBottom
                sx={{ color: '#424242' }}
              >
                <strong>Water Level:</strong> {(camera.Water * 100).toFixed(1)}%
              </Typography>
              <Typography 
                variant="body2" 
                gutterBottom
                sx={{ color: '#424242' }}
              >
                <strong>Light Level:</strong> {((camera.Light / 255) * 100).toFixed(1)}%
              </Typography>
              <Typography 
                variant="body2" 
                gutterBottom
                sx={{ color: '#424242' }}
              >
                <strong>Position:</strong> [{camera.Position[0].toFixed(6)}, {camera.Position[1].toFixed(6)}]
              </Typography>
              {camera.ViewDescription && (
                <Typography 
                  variant="body2" 
                  gutterBottom
                  sx={{ color: '#424242' }}
                >
                  <strong>Description:</strong> {camera.ViewDescription}
                </Typography>
              )}
            </Box>
            
            {/* Right side - Placeholder graphic */}
            <Box
              sx={{
                width: 120,
                height: 120,
                bgcolor: '#e0e0e0',
                border: '2px dashed #9e9e9e',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="caption" sx={{ color: '#757575' }}>
                Image
              </Typography>
            </Box>
          </Box>
        </Box>
      </Collapse>
      <Divider />
    </>
  );
};

const CameraList = () => {
  const cameras = useCameraData();

  return (
    <Box
      sx={{
        width: '75%',
        margin: '0 auto',
        mt: 3,
      }}
    >
      <List 
        sx={{ 
          width: '100%', 
          bgcolor: 'background.paper',
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: 1,
        }}
      >
        {cameras.map((camera) => (
          <CameraListItem key={camera.SegmentID} camera={camera} />
        ))}
      </List>
    </Box>
  );
};

export default CameraList;