import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  Download as DownloadIcon,
  History as HistoryIcon,
  Videocam as VideoCameraIcon,
} from '@mui/icons-material';
import { getAllCameraData } from '../utils/cameraData';
import { getLogsByDateRange, downloadCSV, getStorageStats } from '../utils/csvLogger';

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [stats, setStats] = useState(null);

  // Load storage stats on component mount
  React.useEffect(() => {
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

  const handleDownloadAll = async () => {
    setLoading(true);
    setMessage(null);

    try {
      // Get current camera data (all locations)
      const currentData = getAllCameraData();

      // Get all historical data
      let historicalLogs = [];
      try {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        historicalLogs = await getLogsByDateRange(sevenDaysAgo, now);
      } catch (error) {
        console.warn('No historical data available yet:', error);
      }

      // Start with historical data
      const allData = [...historicalLogs];

      // Add current readings to the export
      const timestamp = new Date().toISOString();
      const dateStr = timestamp.split('T')[0];

      for (const camera of currentData) {
        allData.push({
          timestamp: timestamp,
          date: dateStr,
          segmentID: camera.SegmentID,
          position: camera.Position,
          water: camera.Water,
          light: camera.Light,
          status: camera.Status,
        });
      }

      // Sort by timestamp (oldest to newest)
      allData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      // Create CSV content
      const headers = ['Timestamp', 'Date', 'SegmentID', 'Longitude', 'Latitude', 'Water Level', 'Light Level', 'Status'];
      const csvRows = [headers.join(',')];

      for (const log of allData) {
        const row = [
          log.timestamp,
          log.date,
          log.segmentID,
          log.position[0],
          log.position[1],
          log.water,
          log.light,
          log.status
        ];
        csvRows.push(row.join(','));
      }

      const csvContent = csvRows.join('\n');
      const filename = `sewer-monitor-complete-data-${new Date().toISOString().split('T')[0]}.csv`;

      downloadCSV(csvContent, filename);

      const historicalCount = historicalLogs.length;
      const currentCount = currentData.length;

      setMessage({
        type: 'success',
        text: `Successfully exported ${allData.length.toLocaleString()} records! (${historicalCount} historical + ${currentCount} current)`
      });
    } catch (error) {
      setMessage({ type: 'error', text: `Export failed: ${error.message}` });
      console.error('Export error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: '90%',
        maxWidth: '1200px',
        margin: '0 auto',
        mt: 4,
        mb: 4,
      }}
    >
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
          Sewer Monitor Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Welcome to the Sewer Monitoring System. Track water levels, brightness, and status across all camera segments.
        </Typography>

        {/* Stats Cards */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
                <CardContent>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.totalRecords.toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    Total Records
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'secondary.light', color: 'white' }}>
                <CardContent>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.estimatedSizeMB} MB
                  </Typography>
                  <Typography variant="body2">
                    Storage Used
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
                <CardContent>
                  <Typography variant="h4" fontWeight="bold">
                    9
                  </Typography>
                  <Typography variant="body2">
                    Camera Segments
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'warning.light', color: 'white' }}>
                <CardContent>
                  <Typography variant="h4" fontWeight="bold">
                    RAMs
                  </Typography>
                  <Typography variant="body2">
                    Worth of Data Retension
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Download Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
            Export Complete Dataset
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Download all camera data including current readings and up to 7 days of historical records in CSV format.
          </Typography>

          <Button
            variant="contained"
            size="large"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
            onClick={handleDownloadAll}
            disabled={loading}
            sx={{
              py: 2,
              px: 4,
              fontSize: '1.1rem',
              fontWeight: 'bold',
            }}
          >
            {loading ? 'Preparing Download...' : 'Download All Data (CSV)'}
          </Button>

          {message && (
            <Alert severity={message.type} onClose={() => setMessage(null)} sx={{ mt: 2 }}>
              {message.text}
            </Alert>
          )}
        </Box>

        {/* Quick Links */}
        <Box sx={{ mt: 5 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
            Quick Links
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}>
                <CardContent>
                  <VideoCameraIcon sx={{ fontSize: 40, mb: 1, color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight="bold">
                    Live Camera View
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    View real-time data from all camera segments
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}>
                <CardContent>
                  <HistoryIcon sx={{ fontSize: 40, mb: 1, color: 'secondary.main' }} />
                  <Typography variant="h6" fontWeight="bold">
                    Historical Data
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Analyze trends and past readings
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}>
                <CardContent>
                  <DownloadIcon sx={{ fontSize: 40, mb: 1, color: 'success.main' }} />
                  <Typography variant="h6" fontWeight="bold">
                    Data Export
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Export custom date ranges and segments
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Info Section */}
        <Box sx={{ mt: 4, p: 3, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            About the Data
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Current Data:</strong> Shows the latest readings from all 50 camera segments across the sewer network.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            <strong>Historical Data:</strong> Automatically logged every 5 seconds. Data is retained for 7 days and then automatically deleted to conserve storage.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            <strong>CSV Format:</strong> Includes timestamp, date, segment ID, position (longitude/latitude), water level, light level, and status for each reading.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Home;
