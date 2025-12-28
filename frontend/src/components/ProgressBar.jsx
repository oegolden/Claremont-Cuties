import React from "react";
const ProgressBar = ({ progress }) => (
  <div className="progress-bar-wrapper" style={{ margin: "1rem 0" }}>
    <div
      className="progress-bar"
      style={{
        width: "100%",
        background: "#eee",
        borderRadius: "8px",
        height: "16px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${progress}%`,
          background: "#8fa182ff",
          height: "100%",
          transition: "width 0.3s",
        }}
      />
    </div>
  </div>
);

export default ProgressBar;
