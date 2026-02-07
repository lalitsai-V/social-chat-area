import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function useScrollAnimation() {
  const elementsRef = useRef<Set<Element>>(new Set());
  const pathname = usePathname();

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px 0px -50px 0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          elementsRef.current.add(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe all elements with scroll animation classes
    const observeAnimatedElements = () => {
      const animatedElements = document.querySelectorAll(
        ".scroll-animate, .scroll-slide-up, .scroll-slide-right, .scroll-slide-left, .scroll-slide-down"
      );
      animatedElements.forEach((el) => {
        // If element already marked in-view, skip
        if (!el.classList.contains("in-view")) {
          observer.observe(el);
        }
      });
    };

    // Initial observe and also handle newly added elements after route change
    observeAnimatedElements();

    return () => {
      try {
        elementsRef.current.forEach((el) => observer.unobserve(el));
      } catch (e) {
        // ignore
      }
      observer.disconnect();
      elementsRef.current.clear();
    };
    // Re-run when pathname changes so new page elements get observed
  }, [pathname]);
}
