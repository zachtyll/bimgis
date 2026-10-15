/**
 * Runs the flood model off the main thread.
 * In: { grid, params }. Out: snapshots ({ type: 'snapshot', snapshot }, arrays transferred),
 * ending with { type: 'done', snapshot }, or { type: 'error', message }.
 */
import { simulate, type FloodGrid, type FloodParams, type FloodSnapshot } from './simulation';

self.onmessage = (event: MessageEvent<{ grid: FloodGrid; params: FloodParams }>) => {
  const post = (type: 'snapshot' | 'done', snapshot: FloodSnapshot) =>
    (self as unknown as Worker).postMessage({ type, snapshot }, [
      snapshot.depth.buffer,
      snapshot.flowX.buffer,
      snapshot.flowY.buffer,
    ] as ArrayBuffer[]);
  try {
    const { grid, params } = event.data;
    const steps = params.rainSteps + params.settleSteps;
    simulate(grid, params, (s) => post(s.step === steps ? 'done' : 'snapshot', s));
  } catch (err) {
    (self as unknown as Worker).postMessage({ type: 'error', message: String(err) });
  }
};
