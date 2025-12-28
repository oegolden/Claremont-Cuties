import React from 'react';
import { useNavigate } from 'react-router-dom';

const QuizConfirmation = () => {
  const navigate = useNavigate();

  return (
    <div className="quiz-container" style={{ textAlign: 'center', paddingTop: '2rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
      <h1 style={{ marginBottom: '1rem', fontSize: '2rem' }}>Thank You!</h1>
      <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: '#666' }}>
        Your profile has been successfully submitted. We're matching you with compatible people now!
      </p>
      <button
        onClick={() => navigate('/dashboard')}
        style={{
          fontFamily: 'Albert Sans',
          background: '#ff72a1',
          color: '#fff',
          border: 'none',
          padding: '0.75rem 2rem',
          borderRadius: '8px',
          fontSize: '1rem',
          cursor: 'pointer',
          transition: 'background 0.2s'
        }}
        onMouseEnter={(e) => (e.target.style.background = '#ff5a8a')}
        onMouseLeave={(e) => (e.target.style.background = '#ff72a1')}
      >
        Go to Dashboard
      </button>
    </div>
  );
};

export default QuizConfirmation;
