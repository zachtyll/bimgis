import { CanvasTexture, SRGBColorSpace } from 'three';

const SIZE = 64; // canvas pixels; drawn at about half that on screen, so it stays sharp on HiDPI
const cache = new Map<string, CanvasTexture>();

/** A round badge with a number, e.g. how many events a venue has. Shared per colour + label. */
export function pinIcon(color: string, label: string): CanvasTexture {
  const key = `${color}|${label}`;
  let texture = cache.get(key);
  if (texture) return texture;

  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext('2d')!;
  const r = SIZE / 2 - 4;
  ctx.beginPath();
  ctx.arc(SIZE / 2, SIZE / 2, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 4;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${label.length > 2 ? 22 : 28}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, SIZE / 2, SIZE / 2 + 1);

  texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  cache.set(key, texture);
  return texture;
}
