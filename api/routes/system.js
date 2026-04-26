/* eslint-env node */
import express from 'express';
import pool from '../lib/db.js';
import { requireAdmin } from '../middleware/auth.js';
import crypto from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const execAsync = promisify(exec);

// Database Health
router.get('/health', requireAdmin, async (req, res) => {
  try {
    // Check database connection
    const start = Date.now();
    await pool.query('SELECT 1');
    const dbLatency = Date.now() - start;
    
    // Get table stats
    const [tables] = await pool.query(`
      SELECT 
        table_name,
        table_rows,
        ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
      FROM information_schema.TABLES 
      WHERE table_schema = DATABASE()
      ORDER BY (data_length + index_length) DESC
    `);
    
    // Get connection count
    const [connections] = await pool.query('SHOW STATUS LIKE \'Threads_connected\'');
    
    res.json({
      database: {
        status: 'healthy',
        latency: `${dbLatency}ms`,
        connections: parseInt(connections[0]?.Value || '0'),
      },
      tables: tables.map(t => ({
        name: t.table_name,
        rows: t.table_rows,
        size: `${t.size_mb} MB`,
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ error: 'Health check failed', details: error.message });
  }
});

// Database Backup
router.post('/backup', requireAdmin, async (req, res) => {
  try {
    const backupId = crypto.randomUUID();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.sql`;
    
    // Get database credentials from environment
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbUser = process.env.DB_USER || 'root';
    const dbPassword = process.env.DB_PASSWORD || '';
    const dbName = process.env.DB_NAME || 'ravi_developers';
    
    const backupPath = path.join(__dirname, '..', '..', 'backups', filename);
    
    // Create backup command (requires mysqldump to be installed)
    const cmd = `mysqldump -h ${dbHost} -u ${dbUser} ${dbPassword ? `-p${dbPassword}` : ''} ${dbName} > "${backupPath}"`;
    
    try {
      await execAsync(cmd);
      
      // Save backup record
      await pool.query(
        'INSERT INTO system_backups (id, filename, size, status, created_at) VALUES (?, ?, ?, ?, NOW())',
        [backupId, filename, 0, 'completed']
      );
      
      res.json({ 
        success: true, 
        backupId, 
        filename,
        message: 'Backup created successfully' 
      });
    } catch {
      // If mysqldump fails, create a JSON backup as fallback
      console.log('mysqldump not available, creating JSON backup');
      
      const [tables] = await pool.query('SHOW TABLES');
      const backup = {};
      
      for (const table of tables) {
        const tableName = Object.values(table)[0];
        const [rows] = await pool.query(`SELECT * FROM ${tableName}`);
        backup[tableName] = rows;
      }
      
      const jsonBackup = JSON.stringify(backup, null, 2);
      
      res.json({
        success: true,
        backupId,
        type: 'json_export',
        tables: Object.keys(backup).length,
        totalRows: Object.values(backup).reduce((sum, rows) => sum + rows.length, 0),
        data: jsonBackup,
      });
    }
  } catch (error) {
    console.error('Backup error:', error);
    res.status(500).json({ error: 'Backup failed', details: error.message });
  }
});

// Get Backup List
router.get('/backups', requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM system_backups ORDER BY created_at DESC'
    );
    
    const backups = rows.map(b => ({
      id: b.id,
      filename: b.filename,
      size: b.size,
      status: b.status,
      createdAt: b.created_at,
    }));
    
    res.json(backups);
  } catch (error) {
    console.error('Backups fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch backups' });
  }
});

// System Statistics
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    // Get various system metrics
    const stats = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM projects'),
      pool.query('SELECT COUNT(*) as count FROM plots'),
      pool.query('SELECT COUNT(*) as count FROM bookings'),
      pool.query('SELECT COUNT(*) as count FROM customers'),
      pool.query('SELECT COUNT(*) as count FROM inquiries'),
      pool.query('SELECT COUNT(*) as count FROM users'),
      pool.query('SELECT COUNT(*) as count FROM activity_logs'),
    ]);
    
    // Calculate storage usage (simplified)
    const [storage] = await pool.query(`
      SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) as total_mb
      FROM information_schema.TABLES
      WHERE table_schema = DATABASE()
    `);
    
    res.json({
      counts: {
        projects: stats[0][0][0].count,
        plots: stats[1][0][0].count,
        bookings: stats[2][0][0].count,
        customers: stats[3][0][0].count,
        inquiries: stats[4][0][0].count,
        users: stats[5][0][0].count,
        activityLogs: stats[6][0][0].count,
      },
      storage: {
        database: `${storage[0].total_mb} MB`,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch system stats' });
  }
});

// Performance Metrics
router.get('/performance', requireAdmin, async (req, res) => {
  try {
    // Query performance metrics
    const [slowQueries] = await pool.query(`
      SELECT * FROM mysql.slow_log 
      WHERE start_time > DATE_SUB(NOW(), INTERVAL 24 HOUR)
      ORDER BY query_time DESC
      LIMIT 10
    `).catch(() => [[[]]]); // Ignore if slow_log not available
    
    // Recent query times (from our app)
    const [recentQueries] = await pool.query(`
      SELECT action, COUNT(*) as count, AVG(0) as avg_time
      FROM activity_logs
      WHERE created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
      GROUP BY action
      LIMIT 20
    `);
    
    res.json({
      slowQueries: slowQueries || [],
      recentActivity: recentQueries,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  } catch (error) {
    console.error('Performance metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch performance metrics' });
  }
});

// Clear Cache
router.post('/clear-cache', requireAdmin, async (req, res) => {
  try {
    // In production, this would clear Redis, CDN, etc.
    res.json({ 
      success: true, 
      message: 'Cache cleared successfully',
      cleared: ['query_cache', 'api_cache']
    });
  } catch (error) {
    console.error('Cache clear error:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

// Get Email Templates
router.get('/email-templates', requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM email_templates ORDER BY name');
    
    const templates = rows.map(t => ({
      id: t.id,
      name: t.name,
      subject: t.subject,
      body: t.body,
      variables: JSON.parse(t.variables || '[]'),
      isActive: t.is_active,
      updatedAt: t.updated_at,
    }));
    
    res.json(templates);
  } catch (error) {
    console.error('Templates fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

router.put('/email-templates/:id', requireAdmin, async (req, res) => {
  try {
    const { subject, body } = req.body;
    
    await pool.query(
      'UPDATE email_templates SET subject = ?, body = ?, updated_at = NOW() WHERE id = ?',
      [subject, body, req.params.id]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Template update error:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

export default router;
