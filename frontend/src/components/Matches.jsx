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
          }
        });

        if (!response.ok) {
          setError('Unable to load matches.');
          setMatches([]);
          return;
        }

        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          // enrich matches with presigned photo URLs when available
          const token = localStorage.getItem('accessToken');
          const enriched = await Promise.all(data.map(async (m) => {
            if (m.user_photo) return m;
            if (m.user_photo_key) {
              try {
                const r = await fetch(`/api/users/${m.id}/image`, { headers: { Authorization: `Bearer ${token}` } });
                if (r.ok) {
                  const json = await r.json();
                  if (json && json.url) m.user_photo = json.url;
                }
              } catch (e) {
                // ignore
              }
            }
            return m;
          }));
          setMatches(enriched);
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
    const imgUrl = match.user_photo || match.avatar_url || match.photo || match.profile_image || null;
    const initials = (safeText(match.name) || 'U')
      .split(/\s+/)
      .map(s => s[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const handleMessage = () => {
      (async () => {
        try {
          const token = localStorage.getItem('accessToken');
          // call backend to mark this match as started for the current user
          await fetch(`/api/matches/${encodeURIComponent(match.match_id)}/start`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
          });
        } catch (e) {
          console.error('Error marking match start', e);
        } finally {
          navigate(`/messages?to=${encodeURIComponent(match.id)}`);
        }
      })();
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
