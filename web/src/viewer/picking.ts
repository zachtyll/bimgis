/** Max pointer travel (px) between down and up for it to count as a click, not a drag. */
const CLICK_TOLERANCE_PX = 4;

/**
 * Calls `onClick` for clicks on `element`, ignoring camera drags.
 * Returns a function that removes the listeners.
 */
export function onCanvasClick(element: HTMLElement, onClick: (evt: MouseEvent) => void): () => void {
  let down: { x: number; y: number } | null = null;

  const handleDown = (evt: MouseEvent) => {
    down = { x: evt.clientX, y: evt.clientY };
  };
  const handleUp = (evt: MouseEvent) => {
    if (!down) return;
    const moved = Math.hypot(evt.clientX - down.x, evt.clientY - down.y);
    down = null;
    if (moved <= CLICK_TOLERANCE_PX) onClick(evt);
  };

  element.addEventListener('mousedown', handleDown);
  element.addEventListener('mouseup', handleUp);
  return () => {
    element.removeEventListener('mousedown', handleDown);
    element.removeEventListener('mouseup', handleUp);
  };
}
