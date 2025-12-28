import React from 'react';
import { useNavigate } from 'react-router-dom';

const QuizConfirmation = () => {
  const navigate = useNavigate();

  return (
    <div className="quiz-container">
      <div className="quiz-checkmark">✓</div>
      <h1 className="quiz-title">Thank You!</h1>
      <p className="quiz-subtext">
        Your profile has been successfully submitted. We're matching you with compatible people now!
      </p>
      <button className="quiz-dashboard-button" onClick={() => navigate('/dashboard')}>
        Go to Dashboard
      </button>
    </div>
  );
};

export default QuizConfirmation;
