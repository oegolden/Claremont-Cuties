import React, { useState } from "react";
import ProgressBar from "./ProgressBar";
import Question from "./Question";

// Define quiz questions and options
const allQuestions = [
  {
    id: "relationship_type",
    type: "checkbox",
    question: "What are you looking for? (select all)",
    options: ["Romantic relationship", "Friends"],
    required: true,
  },
  {
    id: "romantic_gender_preferences",
    type: "checkbox",
    question: "Romantic: Gender identity preferences",
    options: [
      "Woman",
      "Man",
      "Non-binary",
      "Genderqueer/Genderfluid",
      "Any",
      "Other",
    ],
    required: true,
  },
  {
    id: "romantic_age_range",
    type: "range",
    question: "Romantic: Age range preference?",
    min: 18,
    max: 30,
    required: true,
  },
  {
    id: "romantic_home_campus",
    type: "checkbox",
    question: "Romantic: Home-campus preference?",
    options: [
      "Harvey Mudd",
      "Pitzer",
      "Scripps",
      "Claremont McKenna",
      "Pomona",
      "Any",
    ],
    required: true,
  },
  {
    id: "friends_gender_preferences",
    type: "checkbox",
    question: "Friends: Gender identity preferences",
    options: [
      "Woman",
      "Man",
      "Non-binary",
      "Genderqueer/Genderfluid",
      "Any",
      "Other",
    ],
    required: true,
  },
  {
    id: "friends_age_range",
    type: "range",
    question: "Friends: Age range preference?",
    min: 18,
    max: 30,
    required: true,
  },
  {
    id: "friends_home_campus",
    type: "checkbox",
    question: "Friends: Home-campus preference?",
    options: [
      "Harvey Mudd",
      "Pitzer",
      "Scripps",
      "Claremont McKenna",
      "Pomona",
      "Any",
    ],
    required: false,
  },
  {
    id: "major_dealbreakers",
    type: "checkbox",
    question: "Major Dealbreakers (select all that apply)",
    options: [
      "I only want to be matched with non-smokers",
      "I only want to be matched with non-drinkers",
      "I only want matches with similar political views",
      "I only want matches with similar religious/spiritual views",
      "I only want matches who are okay with casual dating/hookups",
      "None of the above are strict dealbreakers for me",
    ],
    required: true,
  },
  {
    id: "life_goals",
    type: "checkbox",
    question: "Long term life goals (select all that apply)",
    options: [
      "Career-oriented",
      "Creative/artistic career",
      "Academic / Grad School / Research",
      "Starting and raising a family",
      "Living in a big city",
      "Traveling or living abroad",
      "Building community",
      "Living near family",
    ],
    required: true,
  },
  {
    id: "political_views",
    type: "single-slider",
    question: "Political Views (1: very conservative, 5: very progressive)",
    min: 1,
    max: 5,
    required: true,
  },
  {
    id: "religious_views",
    type: "radio",
    question: "Religious/Spiritual views",
    options: [
      "Atheist",
      "Agnostic",
      "Spiritual, but not religious",
      "Christian",
      "Jewish",
      "Muslim",
      "Hindu",
      "Buddhist",
      "Prefer not to say",
      "Other",
    ],
    required: true,
  },
  {
    id: "substance_relationships",
    type: "checkbox",
    question: "Substance relationships (select all that apply)",
    options: [
      "Non-smoker",
      "Non-drinker"
    ],
    required: true,
  },
  {
    id: "energy_level",
    type: "single-slider",
    question: "Personality: Energy Level (1: low, 5: high)",
    min: 1,
    max: 5,
    required: true,
  },
  {
    id: "friday_night",
    type: "single-slider",
    question: "Ideal Friday night (1: quiet night in, 5: out and about)",
    min: 1,
    max: 5,
    required: true,
  },
  {
    id: "handle_conflict",
    type: "single-slider",
    question: "Handle conflict (1: avoidant, 5: direct)",
    min: 1,
    max: 5,
    required: true,
  },
  {
    id: "love_language",
    type: "checkbox",
    question: "Love Language (select top 2)",
    options: [
      "Words of Affirmation",
      "Acts of Service",
      "Receiving Gifts",
      "Quality Time",
      "Physical Touch",
    ],
    required: true,
    maxSelect: 2,
  },
  {
    id: "hobbies",
    type: "checkbox",
    question: "What are your hobbies? (select top 5)",
    options: [
      "Sports/working out",
      "Video games",
      "Reading",
      "Watching movies/TV",
      "Making art",
      "Music",
      "Cooking/Baking",
      "Hiking/outdoors",
      "Partying",
      "Campus clubs/student orgs",
      "Side projects",
      "Social media",
    ],
    required: true,
    maxSelect: 5,
  },
  {
    id: "music_taste",
    type: "checkbox",
    question: "Music taste (select all that apply)",
    options: [
      "Pop",
      "Rock",
      "Hip-hop",
      "Classical",
      "Jazz",
      "Electronic",
      "R&B",
      "Country",
      "Indie",
      "Other",
    ],
    required: true,
  },
  {
    id: "cats_or_dogs",
    type: "radio",
    question: "Cats or dogs?",
    options: ["Cats", "Dogs", "Both", "Neither"],
    required: true,
  },
  {
    id: "favorite_dining_hall",
    type: "radio",
    question: "Favorite dining hall",
    options: [
      "Hoch",
      "Mallott",
      "Collins",
      "McConnell",
      "Frary",
      "Frank",
      "Oldenberg",
    ],
    required: true,
  },
  {
    id: "favorite_cuisine",
    type: "checkbox",
    question: "Favorite cuisine (select top 3)  ",
    options: [
      "American",
      "Italian",
      "Chinese",
      "Mexican",
      "Indian",
      "Japanese",
      "Thai",
      "Mediterranean",
    ],
    required: true,
    maxSelect: 5,
  },
];


const Quiz = () => {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});

  const getFilteredQuestions = () => {
    const rel = answers["relationship_type"] || [];
    return allQuestions.filter((q) => {
      if (
        ["romantic_gender_preferences", "romantic_age_range", "romantic_home_campus"].includes(q.id)
      ) {
        return rel.includes("Romantic relationship");
      }
      if (
        ["friends_gender_preferences", "friends_age_range", "friends_home_campus"].includes(q.id)
      ) {
        return rel.includes("Friends");
      }
      return true;
    });
  };

  const quizQuestions = getFilteredQuestions();
  const question = quizQuestions[current];

  const handleNext = () => {
    if (current < quizQuestions.length - 1) setCurrent(current + 1);
  };
  const handleBack = () => {
    if (current > 0) setCurrent(current - 1);
  };
  const handleAnswer = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const isAnswered = (q, val) => {
    if (!q.required) return true;
    if (q.type === "checkbox") return Array.isArray(val) && val.length > 0;
    if (q.type === "radio" || q.type === "select" || q.type === "scale") return val !== undefined && val !== null && val !== "";
    if (q.type === "number") return val !== undefined && val !== null && val !== "";
    if (q.type === "text") return val && val.trim() !== "";
    return true;
  };

  const progress = ((current + 1) / quizQuestions.length) * 100;
  const canProceed = isAnswered(question, answers[question.id]);
  const isLast = current === quizQuestions.length - 1;

  const handleSubmit = () => {
    if (!canProceed) return;
    // TODO: connect to backend API later
    console.log('Quiz submission:', answers);
    alert('Thanks! Your responses have been recorded locally.');
  };

  return (
    <div className="quiz-container">
      <ProgressBar progress={progress} />
      <Question
        key={question.id}
        question={question}
        value={answers[question.id]}
        onChange={handleAnswer}
      />
      <div className="quiz-nav">
        <button onClick={handleBack} disabled={current === 0} style={{fontFamily: 'Albert Sans'}}>
          Back
        </button>
        {isLast ? (
          <button onClick={handleSubmit} disabled={!canProceed} style={{fontFamily: 'Albert Sans'}}>
            Submit
          </button>
        ) : (
          <button onClick={handleNext} disabled={!canProceed} style={{fontFamily: 'Albert Sans'}}>
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;
