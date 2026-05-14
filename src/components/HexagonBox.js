// src/components/HexagonBox.js
import React from "react";

const HexagonBox = ({ children = "99", size = 64 }) => {
  // viewBox sized so hex looks proportional; text centered
  const width = size;
  const height = Math.round(size * 0.86);
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 86"
      className="block"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="goldGrad" x1="0" x2="1">
          <stop offset="0" stopColor="#f7df8a" />
          <stop offset="1" stopColor="#b8860b" />
        </linearGradient>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.25" />
        </filter>
      </defs>

      <g filter="url(#shadow)">
        <polygon
          points="50 2 92 24 92 62 50 84 8 62 8 24"
          fill="url(#goldGrad)"
          stroke="#8f6a06"
          strokeWidth="2"
        />
        <text
          x="50"
          y="56"
          textAnchor="middle"
          fontSize="34"
          fontWeight="700"
          fill="#081018"
          style={{ fontFamily: "sans-serif" }}
        >
          {children}
        </text>
      </g>
    </svg>
  );
};

export default HexagonBox;
