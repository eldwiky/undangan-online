"use client";

import { useState, useEffect, useCallback } from "react";

interface Section {
  id: string;
  label: string;
}

interface ScrollDotsProps {
  sections: Section[];
  accentColor?: string;
}

export default function ScrollDots({ sections, accentColor = "#d97706" }: ScrollDotsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: "-30% 0px -30% 0px",
      threshold: 0,
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      // Find the first visible section
      const visibleEntries = entries.filter((entry) => entry.isIntersecting);
      if (visibleEntries.length > 0) {
        setActiveId(visibleEntries[0].target.id);
      }
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    // Observe all sections
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Filter to only sections that exist in the DOM
  const [visibleSections, setVisibleSections] = useState<Section[]>([]);

  useEffect(() => {
    const existing = sections.filter(({ id }) => document.getElementById(id));
    setVisibleSections(existing);
  }, [sections]);

  if (visibleSections.length === 0) return null;

  return (
    <nav
      className="fixed right-4 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col items-center gap-3"
      aria-label="Section navigation"
    >
      {visibleSections.map(({ id, label }) => {
        const isActive = activeId === id;
        const isHovered = hoveredId === id;

        return (
          <div key={id} className="relative flex items-center">
            {/* Tooltip */}
            {isHovered && (
              <span
                className="absolute right-full mr-3 px-2 py-1 text-xs font-medium rounded whitespace-nowrap shadow-md"
                style={{
                  backgroundColor: accentColor,
                  color: "#fff",
                }}
              >
                {label}
              </span>
            )}

            {/* Dot */}
            <button
              onClick={() => scrollToSection(id)}
              onMouseEnter={() => setHoveredId(id)}
              onMouseLeave={() => setHoveredId(null)}
              className="rounded-full transition-all duration-200 cursor-pointer"
              style={{
                width: isActive ? 10 : 8,
                height: isActive ? 10 : 8,
                backgroundColor: isActive ? accentColor : "rgba(156, 163, 175, 0.4)",
                boxShadow: isActive ? `0 0 6px ${accentColor}60` : "none",
              }}
              aria-label={`Scroll to ${label}`}
              aria-current={isActive ? "true" : undefined}
            />
          </div>
        );
      })}
    </nav>
  );
}
