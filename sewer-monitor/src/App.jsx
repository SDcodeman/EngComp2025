import './App.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/map">Map</Link>
        <Link to="/list">List View</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<Map />} />
        <Route path="/list" element={<List />} />
        <Route path="*" element={<NotFound />} /> {/* 404 page */}
      </Routes>
    </BrowserRouter>
  );
}

function Home() {
  return (
    <div className="app">
      <header className="header">
        <h1>SEWER VIEWER</h1>
      </header>
      <main className="main">
        <p>Welcome to Sewer Monitor</p>
      </main>
    </div>
  );
}

function Map() {
  return <h1>Map Page</h1>;
}

function List() {
  return <h1>List Page</h1>;
}

function NotFound() {
  return <h1>404 - Page Not Found</h1>;
}

export default App;
