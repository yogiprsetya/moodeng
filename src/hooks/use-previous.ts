import { useEffect, useRef } from "react";

/**
 * Hook that returns the previous value of the given value.
 * Useful for comparing current and previous values in effects.
 *
 * @param value - The value to track
 * @returns The previous value (returns the current value on first render)
 */
export function usePrevious<T>(value: T): T {
  const ref = useRef<T>(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  // Accessing ref.current during render is intentional for usePrevious hook
  // This is a standard pattern for tracking previous values
  // eslint-disable-next-line
  return ref.current;
}
