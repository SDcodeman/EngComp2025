import { Chip } from '@mui/material';
import { Circle as CircleIcon } from '@mui/icons-material';
import { getStatusColor, getStatusLabel } from '../../utils/cameraHelpers';

function CameraStatus({ status }) {
  const color = getStatusColor(status);
  const label = getStatusLabel(status);

  return (
    <Chip
      icon={<CircleIcon sx={{ fontSize: 12, fill: color }} />}
      label={label}
      size="small"
      sx={{
        bgcolor: `${color}20`,
        color: color,
        fontWeight: 600,
        border: `1px solid ${color}40`,
      }}
    />
  );
}

export default CameraStatus;
