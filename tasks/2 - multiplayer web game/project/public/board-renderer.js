const colors = { P1: '#ef6f61', P2: '#4f7cac', apple: '#e15b4f', mushroom: '#d4a72c', grid: '#d8d2c4', background: '#f7f4ec' };
export function renderBoard(canvas, snapshot, presentation = {}) {
  if (!canvas || !snapshot?.board) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width || 400; const h = canvas.height || 240;
  const cellW = w / snapshot.board.w; const cellH = h / snapshot.board.h;
  ctx.fillStyle = colors.background; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = colors.grid; ctx.lineWidth = 0.5;
  for (let x = 0; x <= snapshot.board.w; x += 1) ctx.strokeRect(x * cellW, 0, 0, h);
  for (let y = 0; y <= snapshot.board.h; y += 1) ctx.strokeRect(0, y * cellH, w, 0);
  for (const item of snapshot.food?.apples ?? []) { ctx.fillStyle = colors.apple; ctx.fillRect(item.cell[0] * cellW + 2, item.cell[1] * cellH + 2, Math.max(2, cellW - 4), Math.max(2, cellH - 4)); }
  for (const item of snapshot.food?.mushrooms ?? []) { ctx.fillStyle = colors.mushroom; ctx.beginPath(); ctx.arc((item.cell[0] + 0.5) * cellW, (item.cell[1] + 0.5) * cellH, Math.min(cellW, cellH) * 0.35, 0, Math.PI * 2); ctx.fill(); }
  for (const snake of snapshot.snakes ?? []) for (const cell of snake.body ?? []) { ctx.fillStyle = colors[snake.seat] ?? '#333'; ctx.fillRect(cell[0] * cellW + 1, cell[1] * cellH + 1, Math.max(2, cellW - 2), Math.max(2, cellH - 2)); }
  return presentation;
}
