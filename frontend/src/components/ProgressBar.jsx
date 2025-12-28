import React from "react";
const ProgressBar = ({ progress }) => (
  <div className="progress-bar-wrapper">
    <div className="progress-bar">
      <div
        className="progress-bar-fill"
        style={{
          width: `${progress}%`,
        }}
      />
    </div>
  </div>
);

export default ProgressBar;
