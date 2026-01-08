import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [photoUrl, setPhotoUrl] = useState(null);

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

  useEffect(() => {
    // If the user has a presigned URL already, use it; otherwise fetch when only key present
    let mounted = true;
    const fetchPhoto = async () => {
      if (!user) return;
      if (user.user_photo) {
        setPhotoUrl(user.user_photo);
        return;
      }
      if (user.user_photo_key) {
        try {
          const token = localStorage.getItem('accessToken');
          const resp = await fetch(`/api/users/${user.id}/image`, { headers: { Authorization: `Bearer ${token}` } });
          if (resp.ok) {
            const json = await resp.json();
            if (mounted && json && json.url) setPhotoUrl(json.url);
          }
        } catch (e) {
          // ignore
        }
      }
    };
    fetchPhoto();
    return () => { mounted = false; };
  }, [user]);

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
          <div className="nav-profile">
            <button className="nav-profile-btn" onClick={handleProfileClick}>
              <span>
                {isAuthenticated ? (
                  photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={user?.name || 'Profile'}
                      className="nav-profile-image"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <>
                      <span className="profile-symbol" style={{ fontSize: '1.5em', verticalAlign: 'bottom'}}>☺</span>
                      <span className="profile-name">{user?.name || 'Profile'}</span>
                    </>
                  )
                ) : (
                  'Log in'
                )}
              </span>
            </button>
          </div>
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