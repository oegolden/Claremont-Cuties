import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// TODO: Add a checklist/onboarding steps for users

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <main className="main-content">
      <div className="home-container">
        <h1>Welcome to Claremont Cuties</h1>
        
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