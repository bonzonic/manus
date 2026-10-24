export function pauseRoom(room) {
  if (room?.phase === 'PLAYING') room.phase = 'PAUSED';
  return room;
}
export function resumeRoom(room) {
  if (room?.phase === 'PAUSED') room.phase = 'RESUMING';
  return room;
}
export function expireRoom(room, nowTick, graceTicks = room?.graceTicks ?? 900) {
  if (!room) return room;
  const absent = ['P1', 'P2'].filter(seat => !room.seats?.[seat]?.connection);
  if (absent.length === 2 && absent.every(seat => room.seats[seat].disconnectedAt != null && nowTick - room.seats[seat].disconnectedAt > graceTicks)) room.phase = 'ABANDONED';
  else if (absent.length === 1 && room.seats[absent[0]].disconnectedAt != null && nowTick - room.seats[absent[0]].disconnectedAt > graceTicks) room.phase = 'RESULTS';
  return room;
}
export function advanceLifecycle(room, nowTick, options = {}) {
  if (room?.phase === 'COUNTDOWN' && room.countdownUntil != null && nowTick >= room.countdownUntil) room.phase = 'PLAYING';
  return expireRoom(room, nowTick, options.graceTicks);
}
