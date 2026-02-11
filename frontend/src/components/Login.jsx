import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, setToken, setUserData } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
      return;
    }

    // Handle OAuth callback
    const token = searchParams.get('token');
    const user = searchParams.get('user');
    const errorParam = searchParams.get('error');

    if (token && user) {
      try {
        const userData = JSON.parse(decodeURIComponent(user));
        setToken(token);
        setUserData(userData);
        navigate('/dashboard');
      } catch (err) {
        console.error('Error parsing user data:', err);
        setError('Error processing login data');
      }
    } else if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [isAuthenticated, navigate, searchParams, setToken, setUserData]);

  const handleGoogleLogin = () => {
    window.location.href = '/auth/google';
  };

  const handleMicrosoftLogin = () => {
    window.location.href = '/auth/microsoft';
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <h1>Welcome to Claremont Cuties</h1>
          <p className="subtitle">Sign in with your school account</p>
          
          {error && (
            <div className="error-message">
              Error signing in: {error}. Please make sure you are using an authorized school email.
            </div>
          )}
          
          <div className="oauth-buttons">
            <button onClick={handleGoogleLogin} className="oauth-button google-button">
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <g fill="#000" fillRule="evenodd">
                  <path d="M9 3.48c1.69 0 2.83.73 3.48 1.34l2.54-2.48C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l2.91 2.26C4.6 5.05 6.62 3.48 9 3.48z" fill="#EA4335"/>
                  <path d="M17.64 9.2c0-.74-.06-1.28-.19-1.84H9v3.34h4.96c-.21 1.18-.84 2.18-1.79 2.85l2.75 2.13c1.78-1.64 2.72-4.05 2.72-6.48z" fill="#4285F4"/>
                  <path d="M3.88 10.78A5.54 5.54 0 0 1 3.58 9c0-.62.11-1.22.29-1.78L.96 4.96A9.008 9.008 0 0 0 0 9c0 1.45.35 2.82.96 4.04l2.92-2.26z" fill="#FBBC05"/>
                  <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.75-2.13c-.76.53-1.78.9-3.21.9-2.38 0-4.4-1.57-5.12-3.74L.96 13.04C2.45 15.98 5.48 18 9 18z" fill="#34A853"/>
                </g>
              </svg>
              Continue with Google
            </button>
            
            <button onClick={handleMicrosoftLogin} className="oauth-button microsoft-button">
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path fill="#F25022" d="M0 0h8v8H0z"/>
                <path fill="#00A4EF" d="M10 0h8v8h-8z"/>
                <path fill="#7FBA00" d="M0 10h8v8H0z"/>
                <path fill="#FFB900" d="M10 10h8v8h-8z"/>
              </svg>
              Continue with Microsoft
            </button>
          </div>
          
          <div className="info-text">
            <p>Only authorized school email domains are allowed.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;