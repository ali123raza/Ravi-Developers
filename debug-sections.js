import 'dotenv/config';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ravi_developers',
});

function safeJSONParse(value, defaultValue = {}) {
  if (!value) return defaultValue;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return defaultValue;
  }
}

async function debug() {
  try {
    console.log('Testing sections query...\n');
    
    const [rows] = await pool.query('SELECT * FROM page_sections WHERE 1=1 ORDER BY page, display_order ASC');
    
    console.log(`Found ${rows.length} sections\n`);
    
    rows.forEach((s, i) => {
      console.log(`\n--- Section ${i + 1} ---`);
      console.log('ID:', s.id);
      console.log('Page:', s.page);
      console.log('Content type:', typeof s.content);
      console.log('Content value:', s.content);
      
      try {
        const parsed = safeJSONParse(s.content);
        console.log('Parsed content:', JSON.stringify(parsed).substring(0, 100));
      } catch (e) {
        console.log('Parse error:', e.message);
      }
    });
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

debug();
