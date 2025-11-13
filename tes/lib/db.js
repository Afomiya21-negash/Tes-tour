import mysql from 'mysql2/promise';

let pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'tes_tour',
      waitForConnections: true,
      connectionLimit: 50, // Increased from 10 to 50 for better concurrency
      queueLimit: 0,
      acquireTimeout: 60000, // 60 seconds timeout for acquiring connections
      timeout: 60000, // 60 seconds query timeout
      reconnect: true, // Auto-reconnect on connection loss
      idleTimeout: 300000, // 5 minutes idle timeout
      maxIdle: 10, // Maximum idle connections
      enableKeepAlive: true, // Keep connections alive
      keepAliveInitialDelay: 0
    });

    // Handle pool errors
    pool.on('connection', (connection) => {
      console.log('New database connection established as id ' + connection.threadId);
    });

    pool.on('error', (err) => {
      console.error('Database pool error:', err);
      if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('Database connection lost, pool will reconnect automatically');
      }
    });

    // Log pool statistics every 5 minutes in development
    if (process.env.NODE_ENV === 'development') {
      setInterval(() => {
        console.log('📊 Database Pool Stats - Active connections in use');
      }, 300000); // 5 minutes
    }
  }
  return pool;
}

export async function connectDB() {
  return getPool().getConnection();
}