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

async function check() {
  try {
    console.log('Checking home sections...\n');
    
    const [rows] = await pool.query(
      'SELECT * FROM page_sections WHERE page = "home" ORDER BY display_order ASC'
    );
    
    console.log(`Found ${rows.length} home sections:\n`);
    
    rows.forEach((s, i) => {
      console.log(`\n--- Section ${i + 1}: ${s.section_key} ---`);
      console.log('Title:', s.title);
      console.log('Content type:', typeof s.content);
      console.log('Content preview:', s.content ? s.content.substring(0, 100) : 'null');
      console.log('Images:', s.images);
      console.log('Buttons:', s.buttons);
      
      try {
        const parsed = safeJSONParse(s.content);
        console.log('Parsed OK:', Object.keys(parsed).join(', '));
      } catch (e) {
        console.log('Parse error:', e.message);
      }
    });
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

check();
