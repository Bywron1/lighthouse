import type { Direction } from "./rooms";

// Shorter swipes are treated as taps or wobbles, not moves.
const MIN_DISTANCE = 40;

// The direction of a swipe that moved dx pixels right and dy pixels down, or
// undefined if it was too short or too close to diagonal to be sure. The
// sideways drift can be at most half the main movement.
export function swipeDirection(dx: number, dy: number): Direction | undefined {
  const across = Math.abs(dx);
  const down = Math.abs(dy);
  if (Math.max(across, down) < MIN_DISTANCE) return undefined;
  if (across >= down) {
    if (down > across / 2) return undefined;
    return dx > 0 ? "right" : "left";
  }
  if (across > down / 2) return undefined;
  return dy > 0 ? "down" : "up";
}
