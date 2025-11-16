import './App.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react';
import SewerMap from './components/SewerMap';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

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
        </ul>
      </nav>

      {/* Dark overlay when menu is open */}
      {menuOpen && <div className="backdrop" onClick={closeMenu} />}

      {/* Main content */}
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<SewerMap />} />
          <Route path="/list" element={<List />} />
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

function List() {
  return <h1>List Page</h1>;
}

function NotFound() {
  return <h1>404 - Page Not Found</h1>;
}

export default App;
