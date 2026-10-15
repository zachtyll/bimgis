/**
 * Colour scales for noise levels, in 5 dB bands like Swedish noise maps (pale blue for quiet,
 * through green and yellow, to red, purple and dark blue for the loudest). Every colour comes
 * with its band as text in the legend, and the facade badges show the number itself.
 */
export type NoiseMetric = 'leq' | 'lmax';

const COLORS = ['#eaf6fb', '#c6e6f3', '#9fd2ea', '#b5dd8b', '#fff275', '#f6b24a', '#e8483b', '#a3307f', '#2c2c8c'];

/** Upper limits of the bands (the last band is open). */
const STEPS: Record<NoiseMetric, number[]> = {
  leq: [40, 45, 50, 55, 60, 65, 70, 75],
  lmax: [55, 60, 65, 70, 75, 80, 85, 90],
};

export const METRIC_LABEL: Record<NoiseMetric, string> = {
  leq: 'Equivalent level (24 h)',
  lmax: 'Maximum level',
};

export function noiseColor(metric: NoiseMetric, level: number): string {
  const steps = STEPS[metric];
  const i = steps.findIndex((s) => Math.round(level) < s);
  return COLORS[i < 0 ? steps.length : i];
}

/** Dark text on light bands, white on dark ones. */
export function textColor(background: string): string {
  const n = Number.parseInt(background.slice(1), 16);
  const lum = 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
  return lum > 140 ? '#111' : '#fff';
}

export function legend(metric: NoiseMetric): { label: string; color: string }[] {
  const steps = STEPS[metric];
  return COLORS.map((color, i) => ({
    color,
    label: i === 0 ? `< ${steps[0]}` : i === steps.length ? `≥ ${steps[i - 1]}` : `${steps[i - 1]}–${steps[i]}`,
  }));
}
