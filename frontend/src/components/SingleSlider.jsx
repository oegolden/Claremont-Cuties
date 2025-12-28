import * as React from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

export default function SingleSlider({ value, onChange, min = 1, max = 5, label = "Select value" }) {
  const handleChange = (event, newValue) => {
    onChange(newValue);
  };

  return (
    <Box sx={{ width: 300, margin: '0 auto' }}>
      <div style={{ marginBottom: 8 }}>{label}</div>
      <Slider
        value={value || min}
        min={min}
        max={max}
        step={1}
        marks
        onChange={(e, v) => handleChange(e, v)}
        valueLabelDisplay="auto"
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </Box>
  );
}
