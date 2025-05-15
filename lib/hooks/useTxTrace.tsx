import { useQuery } from '@tanstack/react-query';

interface TraceCall {
  type: string;
  from: string;
  to: string;
  value?: string;
  gas?: string;
  gasUsed?: string;
  input?: string;
  output?: string;
  error?: string;
  calls?: Array<TraceCall>;
}

interface TraceResult {
  type: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasUsed: string;
  input: string;
  error?: string;
  calls?: Array<TraceCall>;
}

interface JsonRpcResponse {
  jsonrpc: string;
  id: number;
  result?: TraceResult;
  error?: {
    code: number;
    message: string;
  };
}

// Base hook for fetching transaction traces
function useTxTrace(hash: string | null | undefined) {
  return useQuery<TraceResult | null>({
    queryKey: [ 'tx_trace', hash ],
    queryFn: async() => {
      if (!hash) {
        return null;
      }

      try {
        const response = await fetch('https://debug.rpc.quai.network/cyprus1', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'debug_traceTransaction',
            params: [
              hash,
              { tracer: 'callTracer' },
            ],
            id: 1,
          }),
        });

        const data = await response.json() as JsonRpcResponse;

        if (data.error) {
          console.error('RPC error:', data.error);
          throw new Error(data.error.message);
        }

        return data.result || null;
      } catch (error) {
        console.error('Failed to fetch transaction trace:', error);
        throw error;
      }
    },
    enabled: Boolean(hash),
  });
}

/**
 * Walk the `debug_traceTransaction` call‑tree and return the
 * deepest (most‑nested) error that can be found.
 */
function findMostSpecificError(
  call: TraceCall | null,
  depth = 0,
): { error: string; depth: number } | null {
  if (!call) {
    return null;
  }

  // 1) keep the error on the current frame as our best candidate for now
  let best: { error: string; depth: number } | null =
      call.error ? { error: call.error, depth } : null;

  // 2) search all nested calls; if any error is deeper than `best`, prefer it
  if (call.calls) {
    for (const nested of call.calls) {
      const nestedError = findMostSpecificError(nested, depth + 1);
      if (nestedError && (!best || nestedError.depth > best.depth)) {
        best = nestedError;
      }
    }
  }

  return best;
}

// Hook for getting just the error from a trace
export function useTxErrorTrace(hash: string | null | undefined) {
  const traceQuery = useTxTrace(hash);

  return useQuery<string | null>({
    queryKey: [ 'tx_error_trace', hash, traceQuery.data ],
    queryFn: async() => {
      if (!traceQuery.data) {
        return null;
      }

      const error = findMostSpecificError(traceQuery.data);
      return error?.error || null;
    },
    enabled: Boolean(hash) && Boolean(traceQuery.data),
  });
}

// Hook for getting the raw trace
export function useTxRawTrace(hash: string | null | undefined) {
  return useTxTrace(hash);
}
