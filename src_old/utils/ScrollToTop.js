import { useEffect, createContext, useContext, useRef } from "react";
import { useLocation } from "react-router-dom";

export const ScrollContainerContext = createContext(null);

export function ScrollContainerProvider({ children }) {
  const mainRef = useRef(null);
  return (
    <ScrollContainerContext.Provider value={mainRef}>
      {children}
    </ScrollContainerContext.Provider>
  );
}

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const mainRef = useContext(ScrollContainerContext);

  useEffect(() => {
    const el = mainRef?.current;

    const reset = () => {
      // Reset every possible scrollable element
      if (el) el.scrollTop = 0;
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // Also reset all parent elements of mainRef
      let parent = el?.parentElement;
      while (parent) {
        parent.scrollTop = 0;
        parent = parent.parentElement;
      }
    };

    // 4 attempts at different times
    reset();
    const r = requestAnimationFrame(reset);
    const t1 = setTimeout(reset, 50);
    const t2 = setTimeout(reset, 200);

    return () => {
      cancelAnimationFrame(r);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pathname]);

  return null;
}