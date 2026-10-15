/**
 * Fetches and converts I3S geometry buffers off the main thread (see I3SEntity).
 * In: { id, url, hasRegion, textured, colors, ex, ey } or { cancel: id }.
 * Out: { id, positions, normals, uv?, colors?, featureIds, faceRanges, minZ, maxZ } (transferred)
 *      or { id, error }.
 */

interface Job {
  id: number;
  url: string;
  hasRegion: boolean;
  textured: boolean;
  /** Return vertex colours for untextured tiles. */
  colors: boolean;
  /** Columns of the 2×2 layer→scene Jacobian. */
  ex: [number, number];
  ey: [number, number];
}

const controllers = new Map<number, AbortController>();

self.onmessage = async (event: MessageEvent<Job | { cancel: number }>) => {
  const msg = event.data;
  if ('cancel' in msg) {
    controllers.get(msg.cancel)?.abort();
    return;
  }
  const controller = new AbortController();
  controllers.set(msg.id, controller);
  try {
    const res = await fetch(msg.url, { signal: controller.signal });
    if (!res.ok) throw new Error(`geometry: HTTP ${res.status}`);
    const result = convert(await res.arrayBuffer(), msg);
    (self as unknown as Worker).postMessage(result.message, result.transfer);
  } catch (err) {
    (self as unknown as Worker).postMessage({ id: msg.id, error: (err as Error).name === 'AbortError' ? 'aborted' : String(err) });
  } finally {
    controllers.delete(msg.id);
  }
};

function convert(buffer: ArrayBuffer, job: Job) {
  const view = new DataView(buffer);
  const vc = view.getUint32(0, true);
  const fc = view.getUint32(4, true);
  let o = 8;
  const pos = new Float32Array(buffer, o, vc * 3);
  o += vc * 12;
  const nrm = new Float32Array(buffer, o, vc * 3);
  o += vc * 12;
  const uv = new Float32Array(buffer, o, vc * 2);
  o += vc * 8;
  const col = new Uint8Array(buffer, o, vc * 4);
  o += vc * 4;
  const region = job.hasRegion ? new Uint16Array(buffer, o, vc * 4) : null;
  if (job.hasRegion) o += vc * 8;

  // Per-feature table: one feature = one building. Ids are UInt64 (OBJECTIDs fit in 53 bits).
  const featureIds = new Float64Array(fc);
  for (let i = 0; i < fc; i++) featureIds[i] = view.getUint32(o + i * 8, true) + view.getUint32(o + i * 8 + 4, true) * 2 ** 32;
  o += fc * 8;
  const faceRanges = new Uint32Array(fc * 2);
  for (let i = 0; i < fc * 2; i++) faceRanges[i] = view.getUint32(o + i * 4, true);

  const { ex, ey } = job;
  const positions = new Float32Array(vc * 3);
  const normals = new Float32Array(vc * 3);
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (let i = 0; i < vc; i++) {
    const x = pos[i * 3];
    const y = pos[i * 3 + 1];
    const z = pos[i * 3 + 2];
    positions[i * 3] = ex[0] * x + ey[0] * y;
    positions[i * 3 + 1] = ex[1] * x + ey[1] * y;
    positions[i * 3 + 2] = z;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
    const nx = ex[0] * nrm[i * 3] + ey[0] * nrm[i * 3 + 1];
    const ny = ex[1] * nrm[i * 3] + ey[1] * nrm[i * 3 + 1];
    const nz = nrm[i * 3 + 2];
    const len = Math.hypot(nx, ny, nz) || 1;
    normals[i * 3] = nx / len;
    normals[i * 3 + 1] = ny / len;
    normals[i * 3 + 2] = nz / len;
  }

  let uvOut: Float32Array | null = null;
  let colors: Uint8Array | null = null;
  if (job.textured) {
    uvOut = new Float32Array(vc * 2);
    for (let i = 0; i < vc * 2; i++) {
      const v = uv[i];
      if (!region) {
        uvOut[i] = v;
        continue;
      }
      // Texture atlas: map the (possibly repeating) uv into the sub-image's region.
      const k = i % 2;
      const vertex = (i - k) / 2;
      let f = v - Math.floor(v);
      if (f === 0 && v !== 0) f = 1;
      const min = region[vertex * 4 + k] / 65535;
      const max = region[vertex * 4 + 2 + k] / 65535;
      uvOut[i] = min + f * (max - min);
    }
  } else if (job.colors) {
    colors = new Uint8Array(col);
  }

  const message = { id: job.id, positions, normals, uv: uvOut, colors, featureIds, faceRanges, minZ, maxZ };
  const transfer: ArrayBuffer[] = [positions.buffer, normals.buffer, featureIds.buffer, faceRanges.buffer] as ArrayBuffer[];
  if (uvOut) transfer.push(uvOut.buffer as ArrayBuffer);
  if (colors) transfer.push(colors.buffer as ArrayBuffer);
  return { message, transfer };
}
