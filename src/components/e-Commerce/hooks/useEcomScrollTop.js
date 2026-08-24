import { useEffect, useContext } from "react";
import { ScrollContainerContext } from "../../../utils/ScrollToTop";

/**
 * useEcomScrollTop — scroll the ecommerce view back to the top whenever `dep`
 * changes (pass location.key). Needed for same-path navigations the global
 * pathname-keyed ScrollToTop skips: the section "View all" pages, category
 * selection, and "You May Also Like" (product → product).
 *
 * Mirrors ScrollToTop's proven approach — reset every scroll candidate (#root
 * is the real scroller here; html/body are position:fixed) with a few timed
 * retries so it sticks on a real device where layout settles asynchronously.
 * Scoped to ecommerce; the shared saving-app ScrollToTop is not touched.
 */
export default function useEcomScrollTop(dep) {
  const mainRef = useContext(ScrollContainerContext);

  useEffect(() => {
    const reset = () => {
      const root = document.getElementById("root");
      if (root) root.scrollTop = 0;
      const el = mainRef?.current;
      if (el) el.scrollTop = 0;
      window.scrollTo(0, 0);
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
      // Also every ancestor of <main>, in case the WebView scrolls one of them.
      let parent = el?.parentElement;
      while (parent) {
        parent.scrollTop = 0;
        parent = parent.parentElement;
      }
    };

    reset();
    const r = requestAnimationFrame(reset);
    const t1 = setTimeout(reset, 50);
    const t2 = setTimeout(reset, 200);
    return () => {
      cancelAnimationFrame(r);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [dep, mainRef]);
}
