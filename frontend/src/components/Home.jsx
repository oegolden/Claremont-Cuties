import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProgressBar from './ProgressBar';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [hasStartedMatch, setHasStartedMatch] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setHasStartedMatch(false);
      return;
    }

    let isMounted = true;

    const fetchMatches = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`/api/matches/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) return;
        const data = await response.json();
        const started = Array.isArray(data) ? data.some(match => match.start) : false;
        if (isMounted) setHasStartedMatch(started);
      } catch (err) {
        if (isMounted) setHasStartedMatch(false);
      }
    };

    fetchMatches();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user]);

  const isFilled = (value) => Boolean(String(value ?? '').trim());
  const profileComplete = Boolean(
    isAuthenticated && user &&
    isFilled(user.name) &&
    isFilled(user.age) &&
    isFilled(user.campus) &&
    isFilled(user.year) &&
    isFilled(user.gender) &&
    isFilled(user.sexual_orientation) &&
    Boolean(user.user_photo)
  );

  const quizComplete = Boolean(isAuthenticated && user && user.form_id);

  const homeTasks = [
    { id: 'profile', label: 'set up profile', complete: profileComplete },
    { id: 'quiz', label: 'take the matching quiz', complete: quizComplete },
    { id: 'message', label: 'message a match', complete: hasStartedMatch }
  ];

  const totalTasks = homeTasks.length;
  const completedTasks = homeTasks.filter(task => task.complete).length;
  const progressValue = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <main className="main-content home-main">
      <div className="home-container">
        <div className="home-frame">
          <div className="home-art" aria-hidden="true">
            <img className="home-doily" src="/assets/doily.png" alt="" />
            <img className="home-envelope" src="/assets/envelope.png" alt="" />
            <img className="home-logo" src="/assets/logo.png" alt="" />
          </div>

          <div className="todo-section home-todo-card">
            <h2 className="section-title">to do list</h2>
            <div className="todo-progress-meta">{completedTasks} of {totalTasks} complete</div>
            <ProgressBar progress={progressValue} />
            <ul className="todo-list home-todo-list">
              {homeTasks.map((task) => {
                const getRoute = () => {
                  switch (task.id) {
                    case 'profile':
                      return '/dashboard';
                    case 'quiz':
                      return '/quiz';
                    case 'message':
                      return task.complete ? '/messages' : null;
                    default:
                      return null;
                  }
                };
                const route = getRoute();
                
                return (
                  <li 
                    key={task.id} 
                    className={`todo-item home-todo-item${task.complete ? ' completed' : ''}${route ? ' clickable' : ''}`}
                    onClick={() => route && navigate(route)}
                    style={route ? { cursor: 'pointer' } : {}}
                  >
                    <div className="todo-label">{task.label}</div>
                    {task.complete && <span className="todo-badge">done</span>}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;