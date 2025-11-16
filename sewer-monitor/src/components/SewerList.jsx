import React, { useState } from 'react';
import {
  List,
  ListItemButton,
  Collapse,
  Box,
  Typography,
  Chip,
  Divider,
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  Warning as WarningIcon,
} from '@mui/icons-material';

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
          <Typography variant="body1" sx={{ minWidth: 80 }}>
            ID: {camera.SegmentID}
          </Typography>

          {/* Position (Longitude, Latitude) */}
          <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
            Lon: {camera.Position[0].toFixed(4)}, Lat: {camera.Position[1].toFixed(4)}
          </Typography>

          {/* Water Warning Icon */}
          {hasWaterWarning && (
            <WarningIcon color="error" sx={{ mr: 1 }} />
          )}

          {/* Expand Icon */}
          {open ? <ExpandLess /> : <ExpandMore />}
        </Box>
      </ListItemButton>

      {/* Expanded Content */}
      <Collapse in={open} timeout="auto" unmountOnExit>
        <Box sx={{ pl: 4, pr: 2, py: 2, bgcolor: 'background.default' }}>
          <Typography variant="body2" gutterBottom>
            <strong>Water Level:</strong> {(camera.Water * 100).toFixed(1)}%
          </Typography>
          <Typography variant="body2" gutterBottom>
            <strong>Light Level:</strong> {(camera.Light * 100).toFixed(1)}%
          </Typography>
          <Typography variant="body2" gutterBottom>
            <strong>Position:</strong> [{camera.Position[0].toFixed(6)}, {camera.Position[1].toFixed(6)}]
          </Typography>
          {camera.ViewDescription && (
            <Typography variant="body2" gutterBottom>
              <strong>Description:</strong> {camera.ViewDescription}
            </Typography>
          )}
        </Box>
      </Collapse>
      <Divider />
    </>
  );
};

const CameraList = () => {
  const [cameras] = useState([
    {
      Position: [0, 0.5475666671991348],
      SegmentID: 0,
      Water: 0,
      Light: 0.974942615630807,
      Status: 'OK',
    },
    {
      Position: [1.648718842236164, 2],
      SegmentID: 1,
      Water: 0,
      Light: 0.30122279652394557,
      Status: 'LOWLIGHT',
    },
    {
      Position: [1.5006984113699566, 1],
      SegmentID: 2,
      Water: 0.5,
      Light: 0.49612580114192534,
      Status: 'OK',
    },
  ]);

  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {cameras.map((camera) => (
        <CameraListItem key={camera.SegmentID} camera={camera} />
      ))}
    </List>
  );
};

export default CameraList;