const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const config = require('./config');
const db = require('./config/db');

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
io.on('connection', (socket) => {
  // client should emit 'identify' with their user id to join their personal room
  socket.on('identify', (userId) => {
    try {
      const room = `user_${userId}`;
      socket.join(room);
    } catch (e) {
      // ignore
    }
  });

  // send a message to a userId
  socket.on('message', (payload) => {
    // payload: { to, from, text }
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