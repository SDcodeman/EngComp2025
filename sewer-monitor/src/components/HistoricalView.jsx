import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import { getLogsBySegment, getHourlyAggregates } from '../utils/csvLogger';

const HistoricalView = () => {
  const [selectedSegment, setSelectedSegment] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  const segments = [0, 1, 2, 3, 4, 5, 6, 7, 8]; // Based on your camera data

  // Set default dates (last 24 hours)
  useEffect(() => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    setEndDate(now.toISOString().slice(0, 16));
    setStartDate(yesterday.toISOString().slice(0, 16));
  }, []);

  // Load data when segment or date changes
  useEffect(() => {
    if (startDate && endDate) {
      loadHistoricalData();
    }
  }, [selectedSegment, startDate, endDate]);

  const loadHistoricalData = async () => {
    setLoading(true);

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const logs = await getLogsBySegment(selectedSegment, start, end);

      setHistoricalData(logs);

      // Calculate statistics
      if (logs.length > 0) {
        const waterLevels = logs.map(l => l.water);
        const lightLevels = logs.map(l => l.light);

        setStats({
          dataPoints: logs.length,
          avgWater: (waterLevels.reduce((a, b) => a + b, 0) / waterLevels.length).toFixed(4),
          minWater: Math.min(...waterLevels).toFixed(4),
          maxWater: Math.max(...waterLevels).toFixed(4),
          avgLight: (lightLevels.reduce((a, b) => a + b, 0) / lightLevels.length).toFixed(2),
          minLight: Math.min(...lightLevels),
          maxLight: Math.max(...lightLevels),
        });
      } else {
        setStats(null);
      }
    } catch (error) {
      console.error('Failed to load historical data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Box sx={{ width: '85%', margin: '0 auto', mt: 3 }}>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
          Historical Data Viewer
        </Typography>

        {/* Controls */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Camera Segment</InputLabel>
              <Select
                value={selectedSegment}
                label="Camera Segment"
                onChange={(e) => setSelectedSegment(e.target.value)}
              >
                {segments.map((seg) => (
                  <MenuItem key={seg} value={seg}>
                    Segment {seg}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Start Date & Time"
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="End Date & Time"
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        {/* Statistics */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && stats && (
          <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Statistics for Segment {selectedSegment}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Data Points
                  </Typography>
                  <Typography variant="h6">
                    {stats.dataPoints}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Avg Water Level
                  </Typography>
                  <Typography variant="h6">
                    {(stats.avgWater * 100).toFixed(1)}%
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Water Range
                  </Typography>
                  <Typography variant="body2">
                    {(stats.minWater * 100).toFixed(1)}% - {(stats.maxWater * 100).toFixed(1)}%
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Avg Brightness
                  </Typography>
                  <Typography variant="h6">
                    {((stats.avgLight / 255) * 100).toFixed(1)}%
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {!loading && !stats && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              No data available for the selected segment and date range
            </Typography>
          </Box>
        )}

        {/* Data Table */}
        {!loading && historicalData.length > 0 && (
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Recent Readings (Last {Math.min(historicalData.length, 20)})
            </Typography>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f5f5f5' }}>
                <tr>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                    Timestamp
                  </th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                    Water Level
                  </th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                    Brightness
                  </th>
                  <th style={{ padding: '8px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {historicalData.slice(-20).reverse().map((log, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px' }}>
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td style={{ padding: '8px' }}>
                      {(log.water * 100).toFixed(1)}%
                    </td>
                    <td style={{ padding: '8px' }}>
                      {((log.light / 255) * 100).toFixed(1)}%
                    </td>
                    <td style={{ padding: '8px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        backgroundColor:
                          log.status === 'OK' ? '#4caf50' :
                          log.status === 'LOWLIGHT' ? '#ff9800' : '#f44336',
                        color: 'white',
                      }}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default HistoricalView;
