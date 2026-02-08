"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function scrollMainToTop() {
  window.scrollTo(0, 0);
  const main = document.querySelector("[data-main-scroll]");
  if (main) main.scrollTop = 0;
}

export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    scrollMainToTop();
    const t1 = setTimeout(scrollMainToTop, 50);
    const t2 = setTimeout(scrollMainToTop, 200);
    const t3 = setTimeout(scrollMainToTop, 500);
    const t4 = setTimeout(scrollMainToTop, 1000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [pathname]);

  return null;
}
