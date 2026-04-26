import 'dotenv/config';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ravi_developers',
});

async function check() {
  try {
    console.log('Checking sections count...\n');
    
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM page_sections');
    console.log('Total sections:', rows[0].count);
    
    const [pages] = await pool.query('SELECT DISTINCT page FROM page_sections');
    console.log('Pages:', pages.map(p => p.page).join(', '));
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

check();
