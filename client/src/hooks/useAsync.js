import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Runs an async loader on mount (and whenever `deps` change), exposing
 * { data, error, isLoading, refetch }. Centralizing this avoids every page
 * re-implementing its own loading/error state machine and guards against
 * setting state after the component has unmounted.
 */
export function useAsync(loader, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await loader();
      if (mounted.current) setData(result);
    } catch (err) {
      if (mounted.current) setError(err);
    } finally {
      if (mounted.current) setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
  }, [run]);

  return { data, error, isLoading, refetch: run, setData };
}
