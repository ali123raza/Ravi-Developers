import express from 'express';
/* eslint-env node */
import pool from '../lib/db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all settings
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM site_settings ORDER BY `key` ASC");

    const settings = rows.reduce((acc, s) => {
      acc[s[`key`]] = s.value;
      return acc;
    }, {});
    
    res.json(settings);
  } catch (error) {
    console.error('Settings fetch error:', error);
    if (process.env.NODE_ENV !== 'production') {
      return res.json({});
    }
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Get single setting
router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    
    const [rows] = await pool.query("SELECT * FROM site_settings WHERE `key` = ?", [key]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json({ key: rows[0][`key`], value: rows[0].value });
  } catch (error) {
    console.error('Setting fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
});

// Update/upsert setting - Admin only
router.put('/:key', requireAdmin, async (req, res) => {
  try {
    const { key } = req.params;
    const body = req.body;
    
    const value = typeof body === 'string' ? body : JSON.stringify(body);
    const now = new Date();
    
    // Upsert using INSERT ... ON DUPLICATE KEY UPDATE
    await pool.query(
      "INSERT INTO site_settings (`key`, value, updated_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE value = ?, updated_at = ?",
      [key, value, now, value, now]
    );
    
    res.json({ key, value });
  } catch (error) {
    console.error('Setting update error:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

export default router;
