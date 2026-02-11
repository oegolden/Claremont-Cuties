import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// TODO: Add a checklist/onboarding steps for users

const Home = () => {
  const { isAuthenticated } = useAuth();
  
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  useEffect(() => {
    const deadline = new Date('February 6, 2026 23:59:00').getTime();
    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = deadline - now;
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };
    
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="main-content">
      <div className="home-container">
        <h1>Welcome to Claremont Cuties</h1>
        
        <div className="countdown-container">
          {[
            { value: timeLeft.days, label: 'Days' },
            { value: timeLeft.hours, label: 'Hours' },
            { value: timeLeft.minutes, label: 'Minutes' },
            { value: timeLeft.seconds, label: 'Seconds' }
          ].map(({ value, label }) => (
            <div key={label} className="countdown-item">
              <div className="countdown-value">
                {String(value).padStart(2, '0')}
              </div>
              <div className="countdown-label">
                {label}
              </div>
            </div>
          ))}
        </div>
        <h3>until submissions close</h3>
        <br></br>
        <div className="home-content">
          {isAuthenticated ? (
            <p>Visit your <Link to="/dashboard">dashboard</Link> to manage your profile before finding matches and take the <Link to="/quiz">matching quiz</Link>!</p>
          ) : (
            <p>This is your home page. <Link to="/login">Sign in</Link> to access your profile and matches.</p>
          )}
        </div>
      </div>
    </main>
  );
};

export default Home;