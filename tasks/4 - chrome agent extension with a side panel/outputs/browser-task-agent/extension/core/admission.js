const safeOrigin = (url) => {
  try { return new URL(url).origin; } catch { return null; }
};

export function admitSnapshot(snapshot, expectedOrigin) {
  if (!snapshot || typeof snapshot !== 'object') return { ok: false, reason: 'Rendered page evidence is unavailable; open a readable ordinary HTTP(S) page and invoke again' };
  if (!expectedOrigin || safeOrigin(snapshot.url) !== expectedOrigin) return { ok: false, reason: 'Rendered page origin changed or is unavailable; invoke again on the explicit HTTP(S) tab' };
  if (typeof snapshot.text !== 'string' || !snapshot.text.trim()) return { ok: false, reason: 'The selected page has no readable body content; open a non-empty page and invoke again' };
  if (!Array.isArray(snapshot.targets) || snapshot.targets.length === 0) return { ok: false, reason: 'The selected page has no supported rendered targets; open a page with a visible public control and invoke again' };
  if (!snapshot.targets.some((target) => target && typeof target.targetId === 'string' && target.targetId.length > 0)) return { ok: false, reason: 'The selected page has no supported rendered targets; invoke again after the page is ready' };
  return { ok: true };
}
