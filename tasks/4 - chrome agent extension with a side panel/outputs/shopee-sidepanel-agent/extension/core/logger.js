const redact = (value) => String(value ?? '').replace(/Bearer\s+[A-Za-z0-9._-]+/gi, '[redacted bearer]').replace(/(?:sk|key|token)[-_]?[A-Za-z0-9]{8,}/gi, '[redacted secret]').replace(/https?:\/\/[^\s?]+\?[^\s]*/gi, '[redacted url]').replace(/\b(?:password|secret|value|prompt|snapshot|authorization)\s*[:=]\s*[^,;\s]+/gi, '$1=[redacted]').replace(/[\r\n]+/g, ' ').slice(0, 1000);
export function sanitizeLogValue(value) { return redact(value); }
export function createRunLogger({ clock = () => Date.now(), maxEntries = 256, maxBytes = 64 * 1024 } = {}) {
  let records = [];
  const bounded = (entry) => { const safe = { ts: Number(clock()), level: ['debug', 'info', 'warn', 'error'].includes(entry?.level) ? entry.level : 'info', event: redact(entry?.event ?? 'event') }; for (const key of ['actionType', 'modelId', 'targetLabel', 'status', 'reason']) if (entry?.[key] !== undefined) safe[key] = redact(entry[key]); return safe; };
  const trim = () => { while (records.length > maxEntries || new TextEncoder().encode(JSON.stringify(records)).length > maxBytes) records.shift(); };
  return { add(event) { records.push(bounded(event)); trim(); }, entries() { return records.map((x) => ({ ...x })); }, clear() { records = []; }, exportJson() { return JSON.stringify(records); } };
}
