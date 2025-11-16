import { Container, Box, Typography, CircularProgress } from '@mui/material';
import CameraList from '../components/camera/CameraList';
import useCameras from '../hooks/useCameras';

function ListView() {
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography color="error" variant="h6">
          Error: {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Camera Status
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {cameras.length} camera{cameras.length !== 1 ? 's' : ''} monitored
        </Typography>
      </Box>
      <CameraList cameras={cameras} />
    </Container>
  );
}

export default ListView;
