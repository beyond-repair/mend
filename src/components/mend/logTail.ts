import { useEffect, useRef, useState } from "react";
import { freshLines } from "./hud";

/**
 * The lines the most recent step wrote to the log, oldest first, capped at `max` (the newest kept).
 * Holds the batch until a later step writes something new; a commit that writes nothing leaves it.
 * Starts empty on mount, so a panel opened mid-fight shows only what happens while it is open.
 */
export function useLogBatch(log: readonly string[], max: number) {
  const seen = useRef<readonly string[]>(log);
  const [batch, setBatch] = useState<{ lines: string[]; stamp: number }>({ lines: [], stamp: 0 });
  useEffect(() => {
    const fresh = freshLines(seen.current, log);
    seen.current = log;
    if (!fresh.length) return;
    setBatch((b) => ({ lines: fresh.slice(-max), stamp: b.stamp + 1 }));
  }, [log, max]);
  return batch;
}
