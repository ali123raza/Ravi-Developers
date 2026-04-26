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
    console.log('Checking database...\n');
    
    // Check tables
    const [tables] = await pool.query("SHOW TABLES LIKE 'page_sections'");
    console.log('page_sections table exists:', tables.length > 0);
    
    if (tables.length > 0) {
      const [columns] = await pool.query("SHOW COLUMNS FROM page_sections");
      console.log('\nColumns in page_sections:');
      columns.forEach(c => console.log(`  - ${c.Field}: ${c.Type}`));
      
      const [data] = await pool.query("SELECT * FROM page_sections LIMIT 2");
      console.log('\nSample data:', JSON.stringify(data, null, 2));
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

check();
