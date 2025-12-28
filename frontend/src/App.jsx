import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Matches from './components/Matches';
import Messages from './components/Messages';
import Quiz from './components/Quiz';
import QuizConfirmation from './components/QuizConfirmation';
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
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/quiz-confirmation" element={<QuizConfirmation />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/faq" element={<div style={{padding: '20px', textAlign: 'center'}}>FAQ page coming soon!</div>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App
