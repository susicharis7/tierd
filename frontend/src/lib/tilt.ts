/**
 * Deterministic per-id tilt for sticker primitives.
 *
 * Stickers tilt -2° to +2° (the design system's signature wobble). The README
 * is explicit: don't randomize per render — hash the item id so the tilt is
 * stable across mounts. On mobile, halve the range to -1° to +1°.
 */
export function tiltFromId(id: string, maxDeg = 2): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = ((h * 31 + id.charCodeAt(i)) | 0) >>> 0;
  }
  const steps = maxDeg * 10 * 2 + 1; // e.g. maxDeg=2 → 41 steps spanning [-2.0, +2.0]
  return ((h % steps) - maxDeg * 10) / 10;
}
