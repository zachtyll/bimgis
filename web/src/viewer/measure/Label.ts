import { CanvasTexture, LinearFilter, SRGBColorSpace, Sprite, SpriteMaterial, type Camera, type WebGLRenderer } from 'three';

const FONT = 26; // canvas px; drawn at half size, so it stays sharp on HiDPI screens
const LINE = 32;
const PAD = 10;

/**
 * A text label in the scene with a constant size on screen, always drawn on top. Its canvas is
 * redrawn only when the text changes (labels follow the pointer while measuring).
 */
export class Label extends Sprite {
  private readonly canvas = document.createElement('canvas');
  private readonly texture: CanvasTexture;
  private text = '';
  private pxWidth = 0;
  private pxHeight = 0;

  constructor(lines: string[] = [], private readonly accent = '#0f172a') {
    const texture = new CanvasTexture(document.createElement('canvas'));
    super(new SpriteMaterial({ map: texture, depthTest: false, depthWrite: false, transparent: true, sizeAttenuation: false }));
    this.texture = texture;
    this.texture.image = this.canvas;
    this.texture.colorSpace = SRGBColorSpace;
    this.texture.minFilter = LinearFilter;
    this.renderOrder = 2000;
    this.center.set(0.5, -0.15); // sits just above its point
    this.frustumCulled = false;
    this.raycast = () => {}; // labels never take picks
    this.setText(lines);
  }

  setText(lines: string[]): void {
    const text = lines.join('\n');
    if (text === this.text) return;
    this.text = text;
    const ctx = this.canvas.getContext('2d')!;
    ctx.font = `600 ${FONT}px system-ui, sans-serif`;
    const width = Math.ceil(Math.max(1, ...lines.map((l) => ctx.measureText(l).width))) + PAD * 2;
    const height = lines.length * LINE + PAD;
    this.canvas.width = width;
    this.canvas.height = height;
    ctx.font = `600 ${FONT}px system-ui, sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
    ctx.strokeStyle = this.accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(1.5, 1.5, width - 3, height - 3, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#0f172a';
    ctx.textBaseline = 'top';
    lines.forEach((l, i) => ctx.fillText(l, PAD, PAD / 2 + 4 + i * LINE));
    this.texture.needsUpdate = true;
    this.pxWidth = width / 2;
    this.pxHeight = height / 2;
    this.visible = lines.length > 0;
  }

  /** Keep the label at a fixed pixel size (sizeAttenuation off scales by distance in the shader). */
  override onBeforeRender = (renderer: WebGLRenderer, _scene: unknown, camera: Camera) => {
    const h = renderer.getRenderTarget()?.height ?? renderer.domElement.height / renderer.getPixelRatio();
    const fov = 'fov' in camera ? ((camera.fov as number) * Math.PI) / 180 : Math.PI / 4;
    const k = (2 * Math.tan(fov / 2)) / h;
    this.scale.set(this.pxWidth * k, this.pxHeight * k, 1);
    // The world matrix was computed before this hook: bring it up to date with the new scale.
    this.updateMatrix();
    if (this.parent) this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
    else this.matrixWorld.copy(this.matrix);
  };

  dispose(): void {
    this.texture.dispose();
    this.material.dispose();
  }
}
