import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  exportToCSV,
  downloadCSV,
  getStorageStats,
  getHourlyAggregates,
} from '../utils/csvLogger';

const DataExport = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [message, setMessage] = useState(null);

  // Set default dates (last 24 hours)
  useEffect(() => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    setEndDate(now.toISOString().slice(0, 16));
    setStartDate(yesterday.toISOString().slice(0, 16));

    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const storageStats = await getStorageStats();
      setStats(storageStats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleExportCSV = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start > end) {
        setMessage({ type: 'error', text: 'Start date must be before end date' });
        setLoading(false);
        return;
      }

      const csvContent = await exportToCSV(start, end);

      if (csvContent.startsWith('No data')) {
        setMessage({ type: 'warning', text: csvContent });
      } else {
        const filename = `sewer-data-${start.toISOString().split('T')[0]}_to_${end.toISOString().split('T')[0]}.csv`;
        downloadCSV(csvContent, filename);
        setMessage({ type: 'success', text: 'CSV file downloaded successfully!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Export failed: ${error.message}` });
      console.error('Export error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportAggregated = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start > end) {
        setMessage({ type: 'error', text: 'Start date must be before end date' });
        setLoading(false);
        return;
      }

      const aggregatedData = await getHourlyAggregates(start, end);

      if (aggregatedData.length === 0) {
        setMessage({ type: 'warning', text: 'No data available for the selected date range' });
        setLoading(false);
        return;
      }

      // Convert to CSV
      const headers = ['Timestamp', 'SegmentID', 'Longitude', 'Latitude', 'Avg Water', 'Avg Light', 'Min Water', 'Max Water', 'Data Points'];
      const csvRows = [headers.join(',')];

      for (const data of aggregatedData) {
        const row = [
          data.timestamp,
          data.segmentID,
          data.position[0],
          data.position[1],
          data.avgWater.toFixed(4),
          data.avgLight.toFixed(2),
          data.minWater.toFixed(4),
          data.maxWater.toFixed(4),
          data.dataPoints,
        ];
        csvRows.push(row.join(','));
      }

      const csvContent = csvRows.join('\n');
      const filename = `sewer-data-hourly-${start.toISOString().split('T')[0]}_to_${end.toISOString().split('T')[0]}.csv`;
      downloadCSV(csvContent, filename);
      setMessage({ type: 'success', text: 'Aggregated CSV file downloaded successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: `Export failed: ${error.message}` });
      console.error('Export error:', error);
    } finally {
      setLoading(false);
    }
  };

  const setQuickRange = (days) => {
    const now = new Date();
    const past = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    setEndDate(now.toISOString().slice(0, 16));
    setStartDate(past.toISOString().slice(0, 16));
  };

  return (
    <Box sx={{ width: '75%', margin: '0 auto', mt: 3 }}>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
          Data Export & Analytics
        </Typography>

        {/* Storage Statistics */}
        {stats && (
          <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Storage Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Total Records
                  </Typography>
                  <Typography variant="h6">
                    {stats.totalRecords.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Estimated Size
                  </Typography>
                  <Typography variant="h6">
                    {stats.estimatedSizeMB} MB
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Oldest Record
                  </Typography>
                  <Typography variant="body2">
                    {stats.oldestDate ? new Date(stats.oldestDate).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Newest Record
                  </Typography>
                  <Typography variant="body2">
                    {stats.newestDate ? new Date(stats.newestDate).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
              <Button
                startIcon={<RefreshIcon />}
                onClick={loadStats}
                size="small"
                sx={{ mt: 2 }}
              >
                Refresh Stats
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Date Range Selection */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Select Date Range
          </Typography>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Start Date & Time"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
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

          {/* Quick Range Buttons */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button size="small" variant="outlined" onClick={() => setQuickRange(1)}>
              Last 24 Hours
            </Button>
            <Button size="small" variant="outlined" onClick={() => setQuickRange(3)}>
              Last 3 Days
            </Button>
            <Button size="small" variant="outlined" onClick={() => setQuickRange(7)}>
              Last 7 Days
            </Button>
          </Box>
        </Box>

        {/* Export Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
            onClick={handleExportCSV}
            disabled={loading || !startDate || !endDate}
          >
            Export Raw Data (CSV)
          </Button>

          <Button
            variant="contained"
            color="secondary"
            startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
            onClick={handleExportAggregated}
            disabled={loading || !startDate || !endDate}
          >
            Export Hourly Averages (CSV)
          </Button>
        </Box>

        {/* Message Display */}
        {message && (
          <Alert severity={message.type} onClose={() => setMessage(null)}>
            {message.text}
          </Alert>
        )}

        {/* Info Box */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Note:</strong> Data is stored locally in your browser using IndexedDB.
            Raw data is automatically kept for 7 days, after which it's deleted to save space.
            Export your data regularly if you need longer retention.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default DataExport;
