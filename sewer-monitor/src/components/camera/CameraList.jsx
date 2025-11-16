import { Grid2 as Grid } from '@mui/material';
import CameraCard from './CameraCard';

function CameraList({ cameras }) {
  return (
    <Grid container spacing={3}>
      {cameras.map((camera) => (
        <Grid key={camera.id} size={{ xs: 12, sm: 6, md: 4 }}>
          <CameraCard camera={camera} />
        </Grid>
      ))}
    </Grid>
  );
}

export default CameraList;
