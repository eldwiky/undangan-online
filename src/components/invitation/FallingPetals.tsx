"use client";

import { useMemo } from "react";

interface FallingPetalsProps {
  variant?: "hearts" | "petals" | "mixed";
}

interface PetalItem {
  id: number;
  char: string;
  left: number;
  animationDuration: number;
  animationDelay: number;
  opacity: number;
  fontSize: number;
  swayAmount: number;
}

function generatePetals(variant: "hearts" | "petals" | "mixed", count: number): PetalItem[] {
  const hearts = ["♥"];
  const petals = ["🌸"];
  const mixed = ["♥", "🌸", "♥", "🌸", "♥"];

  const chars = variant === "hearts" ? hearts : variant === "petals" ? petals : mixed;

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    char: chars[i % chars.length],
    left: 5 + Math.random() * 90,
    animationDuration: 8 + Math.random() * 7, // 8-15 seconds
    animationDelay: Math.random() * 8, // staggered start
    opacity: 0.1 + Math.random() * 0.1, // 0.1-0.2
    fontSize: 14 + Math.random() * 10,
    swayAmount: 20 + Math.random() * 30,
  }));
}

export default function FallingPetals({ variant = "mixed" }: FallingPetalsProps) {
  const petals = useMemo(() => generatePetals(variant, 10), [variant]);

  return (
    <>
      {/* CSS keyframes injected via style tag */}
      <style>{`
        @keyframes fallingPetal {
          0% {
            transform: translateY(-5vh) translateX(0px) rotate(0deg);
          }
          25% {
            transform: translateY(25vh) translateX(var(--sway)) rotate(90deg);
          }
          50% {
            transform: translateY(50vh) translateX(calc(var(--sway) * -0.5)) rotate(180deg);
          }
          75% {
            transform: translateY(75vh) translateX(var(--sway)) rotate(270deg);
          }
          100% {
            transform: translateY(105vh) translateX(0px) rotate(360deg);
          }
        }
      `}</style>
      <div
        className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        {petals.map((petal) => (
          <span
            key={petal.id}
            className="absolute top-0 will-change-transform"
            style={{
              left: `${petal.left}%`,
              opacity: petal.opacity,
              fontSize: `${petal.fontSize}px`,
              animation: `fallingPetal ${petal.animationDuration}s linear ${petal.animationDelay}s infinite`,
              ["--sway" as string]: `${petal.swayAmount}px`,
            }}
          >
            {petal.char}
          </span>
        ))}
      </div>
    </>
  );
}
