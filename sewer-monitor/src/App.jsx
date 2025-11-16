import './App.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SewerMap from './components/SewerMap';
import CameraList from './components/SewerList';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  // theme: 'light' | 'dark'
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    return localStorage.getItem('theme') || 'dark';
  });

  const closeMenu = () => setMenuOpen(false);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // apply theme to <html> and persist it
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <BrowserRouter>
      {/* Header with hamburger */}
      <header className="app-header">
        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Toggle navigation menu"
        >
          <span />
          <span />
          <span />
        </button>
        <h1 className="app-title">SEWER VIEWER</h1>
      </header>

      {/* Slide-out side menu */}
      <nav className={`side-menu ${menuOpen ? 'open' : ''}`}>
        <ul>
          <li>
            <Link to="/" onClick={closeMenu}>Home</Link>
          </li>
          <li>
            <Link to="/map" onClick={closeMenu}>Map</Link>
          </li>
          <li>
            <Link to="/list" onClick={closeMenu}>List View</Link>
          </li>

          {/* Dark / light mode toggle */}
          <li className="theme-toggle-item">
            <label className="theme-toggle">
              <span>Dark mode</span>
              <input
                type="checkbox"
                checked={theme === 'dark'}
                onChange={toggleTheme}
              />
              <div className="toggle-slider" />
            </label>
          </li>
        </ul>
      </nav>

      {/* Dark overlay when menu is open */}
      {menuOpen && <div className="backdrop" onClick={closeMenu} />}

      {/* Main content */}
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<SewerMap />} />
          <Route path="/list" element={<CameraList />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

function Home() {
  return (
    <div className="home">
      <p>Welcome to Sewer Monitor</p>
    </div>
  );
}

function Map() {
  return <h1>Map Page</h1>;
}

function List() {
  return <><h1>List Page</h1>
  CameraList</>;
}

function NotFound() {
  return <h1>404 - Page Not Found</h1>;
}

export default App;
