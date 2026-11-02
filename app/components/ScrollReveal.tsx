"use client";

import React, { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  variant?: "text" | "box" | "image" | "left" | "right" | "zoom" | "fade";
  delay?: number;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
  threshold?: number;
  once?: boolean;
}

export default function ScrollReveal({
  children,
  variant = "text",
  delay = 0,
  duration,
  className = "",
  style = {},
  threshold = 0.12,
  once = true,
}: ScrollRevealProps): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (typeof IntersectionObserver === "undefined") {
      setIsRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          setIsRevealed(true);
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsRevealed(false);
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -20px 0px",
      }
    );

    observer.observe(element);

    // Fallback: If element is already within viewport on initial render or dynamic insertion
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setIsRevealed(true);
      if (once) {
        observer.unobserve(element);
      }
    }

    return () => {
      observer.disconnect();
    };
  }, [threshold, once, children]);

  const customStyle: React.CSSProperties = {
    ...style,
    transitionDelay: `${delay}ms`,
    ...(duration ? { transitionDuration: `${duration}ms` } : {}),
  };

  return (
    <div
      ref={ref}
      className={`scroll-reveal reveal-${variant} ${isRevealed ? "is-revealed" : ""} ${className}`}
      style={customStyle}
    >
      {children}
    </div>
  );
}
