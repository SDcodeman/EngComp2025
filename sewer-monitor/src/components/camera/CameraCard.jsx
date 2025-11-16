import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import CameraStatus from './CameraStatus';
import { formatTimestamp } from '../../utils/cameraHelpers';

function CameraCard({ camera }) {
  const { name, address, status, lastUpdate, errors, warnings } = camera;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography variant="h6" component="h2" fontWeight={600}>
            {name}
          </Typography>
          <CameraStatus status={status} />
        </Box>

        <Stack spacing={1.5}>
          <Box display="flex" alignItems="center" gap={1}>
            <LocationIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {address}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <TimeIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Last update: {formatTimestamp(lastUpdate)}
            </Typography>
          </Box>

          {errors && errors.length > 0 && (
            <Box>
              {errors.map((error, index) => (
                <Chip
                  key={index}
                  icon={<ErrorIcon />}
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
                  icon={<WarningIcon />}
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
      </CardContent>
    </Card>
  );
}

export default CameraCard;
