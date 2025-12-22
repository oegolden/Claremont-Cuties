const express = require('express');
const app = require('./app');
const config = require('./config');
const db = require('./config/db');

const PORT = (config && config.port) || process.env.PORT || 3000;

const server = app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
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