function send(controller, message) { if (controller.socket?.readyState === 1) controller.socket.send(JSON.stringify(message)); }
export function connectSocket(url, handlers = {}) {
  const Socket = globalThis.WebSocket;
  if (!Socket) throw new Error('WebSocket unavailable');
  const socket = new Socket(url);
  const controller = { socket, handlers, close: () => socket.close() };
  socket.addEventListener('open', () => handlers.onOpen?.(controller));
  socket.addEventListener('message', event => { try { handlers.onMessage?.(JSON.parse(event.data), controller); } catch { handlers.onError?.({ v: 1, type: 'error', code: 'BAD_JSON', message: 'Invalid server message.', retryable: false }); } });
  socket.addEventListener('error', () => handlers.onError?.({ v: 1, type: 'error', code: 'SERVER_UNAVAILABLE', message: 'Server unavailable.', retryable: true }));
  socket.addEventListener('close', () => handlers.onClose?.(controller));
  return controller;
}
export const sendHello = (controller, message) => send(controller, message);
export const sendTurn = (controller, message) => send(controller, message);
export const sendReady = (controller, message) => send(controller, message);
export const sendRematch = (controller, message) => send(controller, message);
export const sendLeave = (controller, message) => send(controller, message);
