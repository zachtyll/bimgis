/**
 * Computes facade noise levels off the main thread.
 * In: NoiseInput. Out: { levels } or { error }.
 */
import { computeNoise, type NoiseInput } from './nordic';

self.onmessage = (event: MessageEvent<NoiseInput>) => {
  try {
    (self as unknown as Worker).postMessage({ levels: computeNoise(event.data) });
  } catch (err) {
    (self as unknown as Worker).postMessage({ error: String(err) });
  }
};
