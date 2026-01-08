import { io } from 'socket.io-client';

let socket = null;

export function connectSocket(token) {
  if (socket) return socket;

  socket = io('/', {
    auth: { token },
    transports: ['websocket'],
    reconnectionAttempts: 5,
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connect error', err);
  });

  socket.on('connect', () => {
    console.log('Socket connected', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected', reason);
  });

  // Relay handlers / helpers from server
  socket.on('typing', (payload) => {
    // default no-op; consumers can register their own listener via `onTyping`
    if (typeof socket._onTyping === 'function') socket._onTyping(payload);
  });

  socket.on('delivered', (payload) => {
    if (typeof socket._onDelivered === 'function') socket._onDelivered(payload);
  });

  socket.on('read', (payload) => {
    if (typeof socket._onRead === 'function') socket._onRead(payload);
  });

  return socket;
}

export function disconnectSocket() {
  if (!socket) return;
  try {
    socket.disconnect();
  } catch (e) {
    // ignore
  }
  socket = null;
}

export function getSocket() {
  return socket;
}

// convenience emitters
export function emitTyping(to, isTyping = true) {
  if (!socket) return;
  socket.emit('typing', { to, isTyping });
}

export function emitDelivered(messageId) {
  if (!socket) return;
  socket.emit('delivered', { messageId });
}

export function emitRead(messageId) {
  if (!socket) return;
  socket.emit('read', { messageId });
}

// convenience listeners
export function onTyping(cb) {
  if (!socket) return;
  socket._onTyping = cb;
}

export function onDelivered(cb) {
  if (!socket) return;
  socket._onDelivered = cb;
}

export function onRead(cb) {
  if (!socket) return;
  socket._onRead = cb;
}
