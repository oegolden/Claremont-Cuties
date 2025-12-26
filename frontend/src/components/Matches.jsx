import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/global.css';

const Matches = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (loading) return;
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchMatches = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`/api/matches/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          cache: 'no-store'
        });

        if (!response.ok) {
          setError('Unable to load matches.');
          setMatches([]);
          return;
        }

        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setMatches(data);
          setError(null);
        } else {
          setMatches([]);
          setError('You have no matches yet.');
        }
      } catch (err) {
        console.error('Error loading matches:', err);
        setError('Error loading matches.');
        setMatches([]);
      } finally {
        setLoadingMatches(false);
      }
    };

    fetchMatches();
  }, [isAuthenticated, loading, user, navigate]);

  if (loading || loadingMatches) {
    return <div className="container">Loading...</div>;
  }

  const safeText = (s) => (s === null || s === undefined) ? '' : String(s);

  const MatchCard = ({ match }) => {
    const imgUrl = match.avatar_url || match.photo || match.profile_image || null;
    const initials = (safeText(match.name) || 'U')
      .split(/\s+/)
      .map(s => s[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const handleMessage = () => {
      navigate(`/messages?to=${encodeURIComponent(match.id)}`);
    };

    return (
      <div className="match-card">
        <div className="match-avatar">
          {imgUrl ? (
            <img src={imgUrl} alt={safeText(match.name) + ' avatar'} />
          ) : (
            <div className="avatar-initials">{initials}</div>
          )}
        </div>
        <div className="match-info">
          <div className="match-name-under">{safeText(match.name) || 'Unnamed'}</div>
          <div className="match-email">{safeText(match.email) || ''}</div>
        </div>
        <button className="btn-primary" onClick={handleMessage}>
          Message
        </button>
      </div>
    );
  };

  return (
    <main className="matches-container">
      <h1 className="matches-title">Your Matches</h1>
      {error ? (
        <div className="matches-intro">{error}</div>
      ) : matches.length > 0 ? (
        <section className="matches-list">
          {matches.map(match => (
            <MatchCard key={match.id} match={match} />
          ))}
        </section>
      ) : (
        <div className="matches-intro">People you've matched with will appear here.</div>
      )}
    </main>
  );
};

export default Matches;
