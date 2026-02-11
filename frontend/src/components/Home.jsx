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

  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    {
      id: 'what-is-cc',
      question: 'What exactly is Claremont Cuties?',
      answer: 'Claremont Cuties is a matchmaking platform designed for the Claremont Colleges community. It uses a detailed compatibility quiz to help you find meaningful connections with other students based on shared interests, values, and preferences.'
    },
    {
      id: 'how-different',
      question: 'How is it different from Datamatch?',
      answer: 'Claremont Cuties runs year-round, so you can find matches any time. It also features more serious and thoughtful questions designed to foster deeper connections, rather than just one-time seasonal events.'
    },
    {
      id: 'privacy',
      question: 'What happens to my information? Is it private?',
      answer: 'Your information is kept private and secure. We only share your profile with potential matches, and you control what information is visible. We never sell your data or share it with third parties. You can delete your account and all your data at any time.'
    }
  ];

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

        <section className="faq-section">
          <h2 className="section-title">frequently asked questions</h2>
          <div className="faq-list">
            {faqs.map((faq) => (
              <div key={faq.id} className="faq-item">
                <button
                  className="faq-question"
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  aria-expanded={expandedFaq === faq.id}
                >
                  <span>{faq.question}</span>
                  <span className="faq-icon">{expandedFaq === faq.id ? '−' : '+'}</span>
                </button>
                {expandedFaq === faq.id && (
                  <div className="faq-answer">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="contact-section">
          <h2 className="section-title">get in touch</h2>
          <div className="contact-content">
            <p>Have questions or feedback? We'd love to hear from you.</p>
            <div className="contact-methods">
              <div className="contact-item">
                <h3>Email</h3>
                <a href="mailto:cuties@claremontcuties.com">cuties@claremontcuties.com</a>
              </div>
              <div className="contact-item">
                <h3>Instagram</h3>
                <a href="https://instagram.com/claremontcuties" target="_blank" rel="noopener noreferrer">@claremontcuties</a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Home;