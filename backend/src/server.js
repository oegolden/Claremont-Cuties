const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const config = require('./config');
const db = require('./config/db');
const { verifyToken } = require('./middleware/jwtAuthentication');
const MessagesService = require('./services/messagesService');

const PORT = (config && config.port) || process.env.PORT || 3000;

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Basic socket.io handlers for direct messaging
io.on('connection', async (socket) => {
  const token = (socket.handshake && socket.handshake.auth && socket.handshake.auth.token) ||
    (socket.handshake && socket.handshake.headers && socket.handshake.headers.authorization && socket.handshake.headers.authorization.split(' ')[1]);

  if (!token) {
    socket.disconnect(true);
    return;
  }

  let user;
  try {
    user = await verifyToken(token);
  } catch (err) {
    socket.disconnect(true);
    return;
  }

  socket.user = user;
  const userRoom = `user_${user.id}`;
  socket.join(userRoom);
  socket.emit('connected', { userId: user.id });

  const messagesService = new MessagesService();

  socket.on('disconnect', () => {
    // clean up presence
  });

  // deliver pending messages that were stored while user offline
  (async () => {
    try {
      const pending = await messagesService.getUndeliveredForUser(user.id);
      for (const m of pending) {
        const payload = {
          to: m.receiver_id || m.reciever_id,
          from: m.sender_id || m.senderID,
          text: m.body || m.text,
          sentAt: m.timestamp || m.sent_at,
          sequence: m.sequence,
          id: m.id,
          status: m.status || 'sent'
        };
        // emit to socket
        socket.emit('message', payload);
        // mark delivered in DB and notify the original sender
        const updated = await messagesService.markDelivered(m.id);
        try {
          io.to(`user_${m.sender_id}`).emit('delivered', { messageId: m.id, to: user.id, delivered_at: (updated && updated.delivered_at) ? updated.delivered_at : new Date().toISOString() });
        } catch (e) {
          // ignore notify errors
        }
      }
    } catch (e) {
      console.error('Error delivering pending messages:', e);
    }
  })();

  // typing indicator: relay to recipient
  socket.on('typing', ({ to, isTyping }) => {
    if (!to) return;
    io.to(`user_${to}`).emit('typing', { from: socket.user.id, isTyping: !!isTyping });
  });

  // delivery receipt
  socket.on('delivered', async ({ messageId }) => {
    if (!messageId) return;
    try {
      const msg = await messagesService.getMessageByID(messageId);
      if (msg) {
        await messagesService.markDelivered(messageId);
        io.to(`user_${msg.sender_id}`).emit('delivered', { messageId, to: socket.user.id, delivered_at: new Date().toISOString() });
      }
    } catch (e) {
      console.error('Error handling delivered event', e);
    }
  });

  // read receipt
  socket.on('read', async ({ messageId }) => {
    if (!messageId) return;
    try {
      const msg = await messagesService.getMessageByID(messageId);
      if (msg) {
        await messagesService.markRead(messageId);
        io.to(`user_${msg.sender_id}`).emit('read', { messageId, to: socket.user.id, read_at: new Date().toISOString() });
      }
    } catch (e) {
      console.error('Error handling read event', e);
    }
  });

  // keep existing simple message relay for backward compatibility
  socket.on('message', (payload) => {
    if (!payload || !payload.to) return;
    const room = `user_${payload.to}`;
    io.to(room).emit('message', payload);
  });
});

let shuttingDown = false;

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  // eslint-disable-next-line no-console
  console.log(`Received ${signal || 'shutdown'} - closing server`);

  const forceTimer = setTimeout(() => {
    console.error('Forcing exit after timeout');
    process.exit(1);
  }, 10000);

  // await server close by wrapping its callback in a Promise
  if (server && server.close) {
    await new Promise((resolve) => server.close(() => resolve()));
  }

  try {
    await db.close(); // calls pool.end() internally
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Error closing DB pool', e);
  } finally {
    clearTimeout(forceTimer);
    process.exit(0);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('uncaughtException', (err) => {
    // eslint-disable-next-line no-console
    console.error('Uncaught exception', err);
    shutdown('uncaughtException');
});
process.on('unhandledRejection', (reason) => {
    // eslint-disable-next-line no-console
    console.error('Unhandled Rejection', reason);
    shutdown('unhandledRejection');
});