"use client";

import { useEffect, useState } from "react";

/** Browser path after mount, so a rewritten static page can still see the real URL. */
export function useLocationPath() {
  const [path, setPath] = useState<string | null>(null);

  useEffect(() => {
    setPath(window.location.pathname);
  }, []);

  return path;
}
