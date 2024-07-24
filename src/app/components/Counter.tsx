import React, { useState, useEffect } from "react";

const Counter = ({ minute }: { minute: number }) => {
  const [count, setCount] = useState(minute * 60); // Convert time to seconds

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prevCount) => prevCount - 1);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const minutes = Math.floor(count / 60); // Calculate minutes
  const seconds = count % 60; // Calculate seconds

  return (
    <span className="text-sm w-[2.25rem]">
      {count > 0 && `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`}
    </span>
  );
};

export default Counter;
