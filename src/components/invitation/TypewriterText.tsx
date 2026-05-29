"use client";

import { useState, useEffect } from "react";

interface TypewriterTextProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function TypewriterText({
  text,
  speed = 80,
  delay = 0,
  className = "",
  style,
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    // Reset on text change
    setDisplayedText("");
    setIsComplete(false);
    setHasStarted(false);

    const startTimer = setTimeout(() => {
      setHasStarted(true);
    }, delay);

    return () => clearTimeout(startTimer);
  }, [text, delay]);

  useEffect(() => {
    if (!hasStarted) return;

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [hasStarted, text, speed]);

  return (
    <span className={className} style={style}>
      {displayedText}
      {!isComplete && hasStarted && (
        <span
          className="inline-block w-[2px] h-[1em] ml-[1px] align-middle animate-pulse"
          style={{ backgroundColor: "currentColor" }}
          aria-hidden="true"
        />
      )}
    </span>
  );
}
