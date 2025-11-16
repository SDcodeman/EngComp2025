import { Box, Typography, Chip, Stack } from '@mui/material';
import {
  AccessTime as TimeIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import CameraStatus from '../camera/CameraStatus';
import { formatTimestamp } from '../../utils/cameraHelpers';

function MapPopup({ camera }) {
  const { name, address, status, lastUpdate, errors, warnings } = camera;

  return (
    <Box sx={{ minWidth: 200, maxWidth: 300 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="subtitle1" fontWeight={600}>
          {name}
        </Typography>
        <CameraStatus status={status} />
      </Box>

      <Stack spacing={1}>
        <Typography variant="body2" color="text.secondary">
          {address}
        </Typography>

        <Box display="flex" alignItems="center" gap={0.5}>
          <TimeIcon fontSize="small" color="action" />
          <Typography variant="caption" color="text.secondary">
            {formatTimestamp(lastUpdate)}
          </Typography>
        </Box>

        {errors && errors.length > 0 && (
          <Box>
            {errors.map((error, index) => (
              <Chip
                key={index}
                icon={<ErrorIcon fontSize="small" />}
                label={error}
                size="small"
                color="error"
                variant="outlined"
                sx={{ mt: 0.5, mr: 0.5 }}
              />
            ))}
          </Box>
        )}

        {warnings && warnings.length > 0 && (
          <Box>
            {warnings.map((warning, index) => (
              <Chip
                key={index}
                icon={<WarningIcon fontSize="small" />}
                label={warning}
                size="small"
                color="warning"
                variant="outlined"
                sx={{ mt: 0.5, mr: 0.5 }}
              />
            ))}
          </Box>
        )}
      </Stack>
    </Box>
  );
}

export default MapPopup;
