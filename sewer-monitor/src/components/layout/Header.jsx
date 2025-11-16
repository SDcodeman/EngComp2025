import { AppBar, Toolbar, Typography, ToggleButton, ToggleButtonGroup, Box } from '@mui/material';
import { List as ListIcon, Map as MapIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentView = location.pathname.includes('/map') ? 'map' : 'list';

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      navigate(`/${newView}`);
    }
  };

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
          Sewer Monitor
        </Typography>
        <Box>
          <ToggleButtonGroup
            value={currentView}
            exclusive
            onChange={handleViewChange}
            aria-label="view toggle"
            size="small"
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              '& .MuiToggleButton-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                border: 'none',
                '&.Mui-selected': {
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                  },
                },
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                },
              },
            }}
          >
            <ToggleButton value="list" aria-label="list view">
              <ListIcon sx={{ mr: 0.5 }} />
              List
            </ToggleButton>
            <ToggleButton value="map" aria-label="map view">
              <MapIcon sx={{ mr: 0.5 }} />
              Map
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
