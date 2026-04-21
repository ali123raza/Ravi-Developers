import 'dotenv/config';
import mysql from 'mysql2/promise';

// Database configuration - uses env vars or defaults
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ravi_developers',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// JWT Secret - CHANGE THIS IN PRODUCTION!
export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export default pool;
