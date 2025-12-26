import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Matches from './components/Matches';
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/quiz" element={<div style={{padding: '20px', textAlign: 'center'}}>Quiz page coming soon!</div>} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/messages" element={<div style={{padding: '20px', textAlign: 'center'}}>Messages page coming soon!</div>} />
            <Route path="/faq" element={<div style={{padding: '20px', textAlign: 'center'}}>FAQ page coming soon!</div>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App
