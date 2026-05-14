import React, { useState, useEffect } from "react";

function Timer({ initialMinutes }) {
  const [seconds, setSeconds] = useState(initialMinutes * 60);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className="bg-black px-4 py-2 rounded-lg font-bold text-lg">
      {minutes}:{secs < 10 ? "0" : ""}{secs}
    </div>
  );
}

export default Timer;
