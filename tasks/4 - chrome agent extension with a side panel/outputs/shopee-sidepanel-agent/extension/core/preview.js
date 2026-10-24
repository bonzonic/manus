const MAX_PREVIEW_VALUE = 160;

export function previewAction(action = {}, origin = '') {
  const lines = [
    `ACTION: ${action.type || 'unknown'}`,
    `ORIGIN: ${origin}`,
    `TARGET: ${action.targetId || 'unknown'}`,
  ];
  if (action.type === 'fill') {
    const sensitive = action.sensitive === true || action.autocompleteSensitive === true;
    if (sensitive) lines.push('VALUE: [redacted]');
    else {
      const raw = String(action.value ?? '');
      lines.push(`VALUE: ${raw.slice(0, MAX_PREVIEW_VALUE)}${raw.length > MAX_PREVIEW_VALUE ? '…' : ''}`);
    }
  }
  const expected = action.type === 'fill' && action.expected && Object.hasOwn(action.expected, 'valueIs')
    ? { ...action.expected, valueIs: action.sensitive === true || action.autocompleteSensitive === true ? '[redacted]' : '[matches bounded VALUE]' }
    : action.expected;
  lines.push(`EXPECTED: ${JSON.stringify(expected)}`, 'One-use approval is required.');
  return lines.join('\n');
}
