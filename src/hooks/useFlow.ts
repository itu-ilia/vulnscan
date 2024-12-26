import { useState, useEffect } from 'react';
import { Flow } from '../types/scan';
import { getFlow } from '../api/scans';

interface UseFlowResult {
  flow: Flow | null;
  isLoading: boolean;
  error: Error | null;
}

export function useFlow(id: string): UseFlowResult {
  const [flow, setFlow] = useState<Flow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchFlow() {
      try {
        setIsLoading(true);
        const data = await getFlow(id);
        if (mounted) {
          setFlow(data);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch flow'));
          setFlow(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchFlow();

    // Poll for updates every 2 seconds if the scan is not completed
    const interval = setInterval(() => {
      if (flow && (flow.status === 'in-progress' || flow.status === 'pending')) {
        fetchFlow();
      }
    }, 2000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [id, flow?.status]);

  return { flow, isLoading, error };
} 