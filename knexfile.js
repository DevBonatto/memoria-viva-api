require('dotenv').config();

const shared = {
  client: 'mysql2',
  migrations: {
    directory: './src/database/migrations',
  },
  pool: { min: 0, max: 10 },
};

module.exports = {
  development: {
    ...shared,
    connection: {
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'memoria_viva',
    },
    useNullAsDefault: true,
  },

  production: {
    ...shared,
    connection: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
    },
  },
};
