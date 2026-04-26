import 'dotenv/config';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ravi_developers',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true // Allow multiple statements
});

async function migrate() {
  try {
    console.log('🚀 Starting CMS database migration...\n');
    
    // Read SQL file
    const sqlFile = path.join(__dirname, 'cms_schema.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('📄 Read SQL file successfully');
    console.log('⚡ Executing SQL statements...\n');
    
    // Execute SQL
    await pool.query(sql);
    
    console.log('✅ Migration completed successfully!');
    console.log('\n📊 Tables created:');
    console.log('  - page_sections');
    console.log('  - theme_settings');
    console.log('  - navigation');
    console.log('  - seo_settings');
    console.log('\n🎉 CMS is ready to use!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
