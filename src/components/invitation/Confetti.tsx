"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfettiProps {
  show: boolean;
}

const COLORS = ["#FFD700", "#F472B6", "#F87171", "#34D399", "#A78BFA"];
const SHAPES = ["circle", "square", "ribbon"] as const;

interface Particle {
  id: number;
  x: number;
  color: string;
  shape: (typeof SHAPES)[number];
  size: number;
  rotation: number;
  drift: number;
  delay: number;
  duration: number;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 40 + Math.random() * 20, // burst from center (40-60% of viewport width)
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    size: 6 + Math.random() * 6,
    rotation: Math.random() * 360,
    drift: (Math.random() - 0.5) * 200, // horizontal drift in px
    delay: Math.random() * 0.3,
    duration: 2 + Math.random() * 1,
  }));
}

function ParticleElement({ particle }: { particle: Particle }) {
  const style: React.CSSProperties = {
    position: "absolute",
    left: `${particle.x}%`,
    top: 0,
    width: particle.shape === "ribbon" ? particle.size * 0.4 : particle.size,
    height: particle.shape === "ribbon" ? particle.size * 2 : particle.size,
    backgroundColor: particle.color,
    borderRadius: particle.shape === "circle" ? "50%" : particle.shape === "ribbon" ? "2px" : "1px",
  };

  return (
    <motion.div
      style={style}
      initial={{
        y: -10,
        x: 0,
        rotate: particle.rotation,
        opacity: 1,
        scale: 0,
      }}
      animate={{
        y: "100vh",
        x: particle.drift,
        rotate: particle.rotation + 360 + Math.random() * 360,
        opacity: [1, 1, 0.8, 0],
        scale: [0, 1.2, 1, 0.8],
      }}
      transition={{
        duration: particle.duration,
        delay: particle.delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    />
  );
}

export default function Confetti({ show }: ConfettiProps) {
  const [visible, setVisible] = useState(false);

  // Reduce particles on mobile
  const particleCount = typeof window !== "undefined" && window.innerWidth < 768 ? 30 : 45;
  const particles = useMemo(() => generateParticles(particleCount), [particleCount]);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="confetti"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-40 pointer-events-none overflow-hidden"
          aria-hidden="true"
        >
          {particles.map((particle) => (
            <ParticleElement key={particle.id} particle={particle} />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
