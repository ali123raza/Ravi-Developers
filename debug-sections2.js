import 'dotenv/config';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ravi_developers',
});

function safeJSONParse(value, defaultValue = {}) {
  console.log('safeJSONParse input:', typeof value, value ? value.toString().substring(0, 50) : 'null');
  if (!value) {
    console.log('  -> returning default (null)');
    return defaultValue;
  }
  if (typeof value === 'object') {
    console.log('  -> returning object as-is');
    return value;
  }
  try {
    const parsed = JSON.parse(value);
    console.log('  -> parsed successfully');
    return parsed;
  } catch (e) {
    console.log('  -> parse error, returning default:', e.message);
    return defaultValue;
  }
}

async function debug() {
  try {
    console.log('Testing full section mapping...\n');
    
    const [rows] = await pool.query('SELECT * FROM page_sections WHERE page = "home" ORDER BY display_order ASC');
    
    console.log(`Found ${rows.length} home sections\n`);
    
    rows.forEach((s, i) => {
      console.log(`\n--- Mapping Section ${i + 1}: ${s.id} ---`);
      
      try {
        const mapped = {
          id: s.id,
          page: s.page,
          sectionKey: s.section_key,
          title: s.title,
          subtitle: s.subtitle,
          content: safeJSONParse(s.content),
          images: safeJSONParse(s.images, []),
          buttons: safeJSONParse(s.buttons, []),
          displayOrder: s.display_order,
          isActive: s.is_active,
          createdAt: s.created_at,
          updatedAt: s.updated_at
        };
        console.log('Mapped successfully:', mapped.id);
      } catch (e) {
        console.log('Mapping error:', e.message);
      }
    });
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

debug();
