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
    console.log('Checking is_active values...\n');
    
    const [rows] = await pool.query(
      'SELECT id, section_key, is_active FROM page_sections WHERE page = "home"'
    );
    
    rows.forEach(r => {
      console.log(`${r.section_key}: is_active=${r.is_active}`);
    });
    
    // Try the exact query from the route
    console.log('\nTrying route query...');
    const [rows2] = await pool.query(
      'SELECT * FROM page_sections WHERE page = ? AND is_active = true ORDER BY display_order ASC',
      ['home']
    );
    console.log(`Found ${rows2.length} rows with is_active=true`);
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

check();
