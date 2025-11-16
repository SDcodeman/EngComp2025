import { Box, CircularProgress, Typography } from '@mui/material';
import MapViewComponent from '../components/map/MapView';
import useCameras from '../hooks/useCameras';

function MapView() {
  const { cameras, loading, error } = useCameras();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="calc(100vh - 64px)"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="calc(100vh - 64px)"
      >
        <Typography color="error" variant="h6">
          Error: {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', width: '100%' }}>
      <MapViewComponent cameras={cameras} />
    </Box>
  );
}

export default MapView;
