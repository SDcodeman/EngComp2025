import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { getLogsBySegment } from '../utils/csvLogger';

const CameraLogSidebar = ({ open, onClose, camera }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState(1); // hours
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (open && camera) {
      loadLogs();
    }
  }, [open, camera, timeRange]);

  const loadLogs = async () => {
    if (!camera) return;

    setLoading(true);

    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - timeRange * 60 * 60 * 1000);

      const data = await getLogsBySegment(camera.SegmentID, startDate, endDate);

      // Sort chronologically (newest first)
      const sortedData = data.sort((a, b) =>
        new Date(b.timestamp) - new Date(a.timestamp)
      );

      setLogs(sortedData);

      // Calculate statistics
      if (sortedData.length > 0) {
        const waterLevels = sortedData.map(l => l.water);
        const lightLevels = sortedData.map(l => l.light);

        // Calculate trend (comparing first half to second half)
        const midPoint = Math.floor(sortedData.length / 2);
        const recentAvgWater = waterLevels.slice(0, midPoint).reduce((a, b) => a + b, 0) / midPoint;
        const olderAvgWater = waterLevels.slice(midPoint).reduce((a, b) => a + b, 0) / (waterLevels.length - midPoint);
        const waterTrend = recentAvgWater - olderAvgWater;

        setStats({
          dataPoints: sortedData.length,
          avgWater: (waterLevels.reduce((a, b) => a + b, 0) / waterLevels.length),
          minWater: Math.min(...waterLevels),
          maxWater: Math.max(...waterLevels),
          avgLight: (lightLevels.reduce((a, b) => a + b, 0) / lightLevels.length),
          minLight: Math.min(...lightLevels),
          maxLight: Math.max(...lightLevels),
          waterTrend: waterTrend,
        });
      } else {
        setStats(null);
      }
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OK':
        return 'success';
      case 'LOWLIGHT':
        return 'warning';
      case 'CRITICAL':
        return 'error';
      default:
        return 'default';
    }
  };

  if (!camera) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 450 } }
      }}
    >
      <Box sx={{ p: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight="bold">
            Camera Segment {camera.SegmentID}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Current Status Card */}
        <Card sx={{ mb: 2, bgcolor: 'primary.light', color: 'white' }}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
              Current Status
            </Typography>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={6}>
                <Typography variant="h4" fontWeight="bold">
                  {(camera.Water * 100).toFixed(1)}%
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Water Level
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h4" fontWeight="bold">
                  {((camera.Light / 255) * 100).toFixed(1)}%
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Brightness
                </Typography>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2 }}>
              <Chip
                label={camera.Status}
                color={getStatusColor(camera.Status)}
                size="small"
                sx={{ fontWeight: 'bold' }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Time Range Selector */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value={1}>Last 1 Hour</MenuItem>
            <MenuItem value={3}>Last 3 Hours</MenuItem>
            <MenuItem value={6}>Last 6 Hours</MenuItem>
            <MenuItem value={12}>Last 12 Hours</MenuItem>
            <MenuItem value={24}>Last 24 Hours</MenuItem>
            <MenuItem value={72}>Last 3 Days</MenuItem>
            <MenuItem value={168}>Last 7 Days</MenuItem>
          </Select>
        </FormControl>

        {/* Statistics */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && stats && (
          <>
            <Card sx={{ mb: 2, bgcolor: 'grey.50' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Statistics ({stats.dataPoints} readings)
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Avg Water
                    </Typography>
                    <Typography variant="h6">
                      {(stats.avgWater * 100).toFixed(1)}%
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      {stats.waterTrend > 0.01 ? (
                        <>
                          <TrendingUpIcon fontSize="small" color="error" />
                          <Typography variant="caption" color="error">
                            Rising
                          </Typography>
                        </>
                      ) : stats.waterTrend < -0.01 ? (
                        <>
                          <TrendingDownIcon fontSize="small" color="success" />
                          <Typography variant="caption" color="success">
                            Falling
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Stable
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Range
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {(stats.minWater * 100).toFixed(1)}% - {(stats.maxWater * 100).toFixed(1)}%
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Avg Brightness
                    </Typography>
                    <Typography variant="h6">
                      {((stats.avgLight / 255) * 100).toFixed(1)}%
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Light Range
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {((stats.minLight / 255) * 100).toFixed(0)}% - {((stats.maxLight / 255) * 100).toFixed(0)}%
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Divider sx={{ my: 2 }} />

            {/* Log Entries */}
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Recent Readings
            </Typography>

            <Box sx={{ maxHeight: 'calc(100vh - 580px)', overflow: 'auto' }}>
              {logs.length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No data available for this time range
                </Typography>
              ) : (
                logs.map((log, index) => (
                  <Card
                    key={index}
                    sx={{
                      mb: 1,
                      bgcolor: index === 0 ? 'action.hover' : 'background.paper',
                      border: index === 0 ? '1px solid' : 'none',
                      borderColor: index === 0 ? 'primary.main' : 'transparent',
                    }}
                  >
                    <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {formatTimestamp(log.timestamp)}
                        </Typography>
                        <Chip
                          label={log.status}
                          color={getStatusColor(log.status)}
                          size="small"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      </Box>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
                            Water Level
                          </Typography>
                          <Typography variant="body1" fontWeight="bold">
                            {(log.water * 100).toFixed(1)}%
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
                            Brightness
                          </Typography>
                          <Typography variant="body1" fontWeight="bold">
                            {((log.light / 255) * 100).toFixed(1)}%
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))
              )}
            </Box>
          </>
        )}

        {!loading && !stats && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              No historical data available yet.
              <br />
              Data will appear here as it's collected.
            </Typography>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default CameraLogSidebar;
