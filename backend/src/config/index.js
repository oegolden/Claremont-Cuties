const config = {
  port: process.env.PORT || 3000,
  db: {
    uri: process.env.DATABASE_URL || 'mongodb://localhost:27017/datamatch',
  },
  api: {
    version: '1.0',
  },
};

export default config;