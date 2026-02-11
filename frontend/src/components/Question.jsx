import React from "react";
import RangeSlider from "./RangeSlider";
import SingleSlider from "./SingleSlider";

const Question = ({ question, value, onChange }) => {
  const handleChange = (e) => {
    const { type, checked, value: val, name } = e.target;
    if (question.type === "checkbox") {
      let arr = Array.isArray(value) ? [...value] : [];
      if (checked) {
        if (!arr.includes(val)) {
          if (question.maxSelect && arr.length >= question.maxSelect) return;
          arr.push(val);
        }
      } else {
        arr = arr.filter((v) => v !== val);
      }
      onChange(question.id, arr);
    } else if (question.type === "radio") {
      onChange(question.id, val);
    } else if (question.type === "number") {
      onChange(question.id, val ? Number(val) : "");
    } else if (question.type === "scale") {
      onChange(question.id, Number(val));
    } else if (question.type === "select") {
      onChange(question.id, val);
    } else if (question.type === "text") {
      onChange(question.id, val);
    }
  };

  let input;
  switch (question.type) {
    case "range":
      input = (
        <RangeSlider
          value={value || [question.min || 18, question.max || 99]}
          onChange={(val) => onChange(question.id, val)}
          min={question.min}
          max={question.max}
          label={question.question}
        />
      );
      break;
    case "single-slider":
      input = (
        <SingleSlider
          value={value || question.min || 1}
          onChange={(val) => onChange(question.id, val)}
          min={question.min}
          max={question.max}
          label={question.question}
        />
      );
      break;
    case "checkbox":
      input = (
        <div>
          {question.options.map((opt) => (
            <span className="custom-checkbox" key={opt}>
              <input
                type="checkbox"
                name={question.id}
                value={opt}
                checked={Array.isArray(value) && value.includes(opt)}
                onChange={handleChange}
                disabled={
                  question.maxSelect &&
                  Array.isArray(value) &&
                  value.length >= question.maxSelect &&
                  !value.includes(opt)
                }
              />
              <span>{opt}</span>
            </span>
          ))}
        </div>
      );
      break;
    case "radio":
      input = (
        <div>
          {question.options.map((opt) => (
            <span className="custom-radio" key={opt}>
              <input
                type="radio"
                name={question.id}
                value={opt}
                checked={value === opt}
                onChange={handleChange}
              />
              <span>{opt}</span>
            </span>
          ))}
        </div>
      );
      break;
    case "number":
      input = (
        <input
          type="number"
          name={question.id}
          value={value || ""}
          onChange={handleChange}
          min={question.min}
          max={question.max}
        />
      );
      break;
    case "scale":
      input = (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {[...Array(question.max - question.min + 1)].map((_, i) => {
            const scaleVal = question.min + i;
            return (
              <label key={scaleVal} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <input
                  type="radio"
                  name={question.id}
                  value={scaleVal}
                  checked={value === scaleVal}
                  onChange={handleChange}
                />
                <span>{scaleVal}</span>
              </label>
            );
          })}
        </div>
      );
      break;
    case "select":
      input = (
        <select name={question.id} value={value || ""} onChange={handleChange}>
          <option value="">Select...</option>
          {question.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
      break;
    case "text":
      input = (
        <input
          type="text"
          name={question.id}
          value={value || ""}
          onChange={handleChange}
        />
      );
      break;
    default:
      input = null;
  }

  return (
    <div className="question-block">
      <h2 className="question-title">{question.question}</h2>
      {input}
    </div>
  );
};

export default Question;
