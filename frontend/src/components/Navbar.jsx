import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/">Datamatch</Link>
        </div>
        <div className="nav-menu">
          <div className="nav-links" style={{verticalAlign: 'bottom'}}>
            {isAuthenticated && (
              <>
                <Link className="nav-profile-btn" to="/quiz">
                  Quiz
                </Link>
                <Link className="nav-profile-btn" to="/matches">
                  Matches
                </Link>
                <Link className="nav-profile-btn" to="/messages">
                  Messages
                </Link>
              </>
            )}
            <Link className="nav-profile-btn" to="/faq">
              FAQ
            </Link>
          </div>
          <button className="nav-profile-btn" onClick={handleProfileClick}>
            <span>
              {isAuthenticated ? (
                <>
                  <span className="profile-symbol" style={{ fontSize: '1.5em', verticalAlign: 'bottom'}}>☺</span>
                  <span className="profile-name">{user?.name || 'Profile'}</span>
                </>
              ) : (
                'Profile'
              )}
            </span>
          </button>
          {isAuthenticated && (
            <button className="nav-profile-btn" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;