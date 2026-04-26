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

async function test() {
  try {
    console.log('Testing mapping...\n');
    
    const [rows] = await pool.query(
      'SELECT * FROM page_sections WHERE page = "home" ORDER BY display_order ASC'
    );
    
    console.log(`Got ${rows.length} rows\n`);
    
    rows.forEach((s, i) => {
      console.log(`Mapping row ${i + 1}: ${s.section_key}`);
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
        console.log(`  -> Mapped OK: ${mapped.id}`);
      } catch (e) {
        console.log(`  -> ERROR: ${e.message}`);
      }
    });
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
