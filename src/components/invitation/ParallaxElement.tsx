"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ParallaxElementProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

export default function ParallaxElement({
  children,
  speed = 0.5,
  className = "",
}: ParallaxElementProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Transform scroll progress to Y offset
  // speed < 1 = moves slower (parallax behind)
  // speed > 1 = moves faster (parallax in front)
  const factor = (speed - 1) * 100;
  const y = useTransform(scrollYProgress, [0, 1], [factor * -1, factor]);

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}
