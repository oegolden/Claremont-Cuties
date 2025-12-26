import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const getToken = () => {
    return localStorage.getItem('accessToken');
  };

  const setToken = (token) => {
    localStorage.setItem('accessToken', token);
  };

  const removeToken = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const setUserData = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const validateAndGetUser = async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return null;
    }

    try {
      const response = await fetch('/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
        setLoading(false);
        return data.user;
      } else {
        // Token invalid or expired
        removeToken();
        setLoading(false);
        return null;
      }
    } catch (error) {
      console.error('Error validating user:', error);
      removeToken();
      setLoading(false);
      return null;
    }
  };

  const logout = async () => {
    try {
      const token = getToken();
      if (token) {
        await fetch('/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      removeToken();
    }
  };

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser && getToken()) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setIsAuthenticated(true);
          // Validate token is still valid
          await validateAndGetUser();
        } catch (error) {
          console.error('Error parsing saved user:', error);
          removeToken();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const value = {
    user,
    isAuthenticated,
    loading,
    setToken,
    getToken,
    removeToken,
    validateAndGetUser,
    logout,
    setUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};