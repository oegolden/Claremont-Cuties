import * as React from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

function valuetext(value) {
  return `${value}`;
}

export default function RangeSlider({ value, onChange, min = 18, max = 99, label = "Select age range" }) {
  const handleChange = (event, newValue) => {
    onChange(newValue);
  };

  return (
    <Box sx={{ width: 300, margin: '0 auto' }}>
      <div style={{ marginBottom: 8 }}>{label}</div>
      <Slider
        getAriaLabel={() => label}
        value={value}
        min={min}
        max={max}
        onChange={handleChange}
        valueLabelDisplay="auto"
        getAriaValueText={valuetext}
        disableSwap
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
        <span>Min: {value[0]}</span>
        <span>Max: {value[1]}</span>
      </div>
    </Box>
  );
}
