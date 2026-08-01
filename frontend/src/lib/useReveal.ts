/**
 * useReveal — lightweight CSS-only scroll entrance hook.
 *
 * Uses a single IntersectionObserver per component (not per element).
 * Adds .is-visible to elements with .reveal class when they enter viewport.
 * This is far cheaper than Framer Motion's whileInView because:
 *   - No React state updates on scroll
 *   - No Framer Motion layout engine running
 *   - Pure CSS transitions (compositor-only: opacity + transform)
 *   - Single shared observer instance per component
 */

'use client';

import { useEffect, useRef } from 'react';

/**
 * Returns a ref to attach to a container element.
 * All .reveal children inside it will animate in when they enter the viewport.
 */
export function useReveal(options?: IntersectionObserverInit) {
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const elements = container.querySelectorAll<HTMLElement>('.reveal');
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target); // Once visible, stop watching
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
        ...options,
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return containerRef;
}
