import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import IPODetailPage from './pages/IPODetailPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/ipo/:id" element={<IPODetailPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;