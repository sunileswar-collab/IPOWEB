import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './App.css';

import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import IPOListPage from './pages/IPOListPage';
import IPODetailPage from './pages/IPODetailPage';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/ipos" element={<IPOListPage />} />
            <Route path="/ipo/:id" element={<IPODetailPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;