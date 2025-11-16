import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/layout/Layout';
import ListView from './views/ListView';
import MapView from './views/MapView';
import './App.css';

// Water/infrastructure themed color scheme
const theme = createTheme({
  palette: {
    primary: {
      main: '#0277bd', // Ocean blue
      light: '#58a5f0',
      dark: '#004c8c',
    },
    secondary: {
      main: '#00897b', // Teal
      light: '#4ebaaa',
      dark: '#005b4f',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/list" replace />} />
            <Route path="/list" element={<ListView />} />
            <Route path="/map" element={<MapView />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
