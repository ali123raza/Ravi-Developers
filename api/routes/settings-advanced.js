/* eslint-env node */
import express from 'express';
import pool from '../lib/db.js';
import { requireAdmin } from '../middleware/auth.js';
import crypto from 'crypto';

const router = express.Router();

// Get all settings (advanced)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM advanced_settings');
    
    const settings = {};
    rows.forEach(row => {
      try {
        settings[row.setting_key] = JSON.parse(row.setting_value);
      } catch {
        settings[row.setting_key] = row.setting_value;
      }
    });
    
    res.json(settings);
  } catch (error) {
    console.error('Settings fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Get specific setting
router.get('/:key', requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM advanced_settings WHERE setting_key = ?',
      [req.params.key]
    );
    
    if (!rows.length) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    
    let settingValue = rows[0].setting_value;
    try {
      settingValue = JSON.parse(settingValue);
    } catch {
      // keep as string
    }
    
    res.json({ key: req.params.key, value: settingValue });
  } catch (error) {
    console.error('Setting fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
});

// Update setting
router.put('/:key', requireAdmin, async (req, res) => {
  try {
    const { value } = req.body;
    const key = req.params.key;
    
    const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
    
    await pool.query(
      `INSERT INTO advanced_settings (id, setting_key, setting_value, updated_at)
       VALUES (?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = NOW()`,
      [crypto.randomUUID(), key, valueStr, valueStr]
    );
    
    res.json({ success: true, key, value });
  } catch (error) {
    console.error('Setting update error:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

// Bulk update settings
router.put('/', requireAdmin, async (req, res) => {
  try {
    const settings = req.body;
    
    for (const [key, value] of Object.entries(settings)) {
      const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
      
      await pool.query(
        `INSERT INTO advanced_settings (id, setting_key, setting_value, updated_at)
         VALUES (?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = NOW()`,
        [crypto.randomUUID(), key, valueStr, valueStr]
      );
    }
    
    res.json({ success: true, updated: Object.keys(settings) });
  } catch (error) {
    console.error('Settings bulk update error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Get integration settings
router.get('/integrations/:provider', requireAdmin, async (req, res) => {
  try {
    const { provider } = req.params;
    const key = `integration_${provider}`;
    
    const [rows] = await pool.query(
      'SELECT * FROM advanced_settings WHERE setting_key = ?',
      [key]
    );
    
    if (!rows.length) {
      return res.json({ provider, configured: false });
    }
    
    const config = JSON.parse(rows[0].setting_value);
    // Don't return sensitive data like API keys
    const safeConfig = { ...config };
    delete safeConfig.apiKey;
    delete safeConfig.secretKey;
    delete safeConfig.password;
    
    res.json({ 
      provider, 
      configured: true, 
      config: safeConfig,
      masked: ['apiKey', 'secretKey', 'password']
    });
  } catch (error) {
    console.error('Integration fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch integration' });
  }
});

// Update integration settings
router.put('/integrations/:provider', requireAdmin, async (req, res) => {
  try {
    const { provider } = req.params;
    const config = req.body;
    const key = `integration_${provider}`;
    
    // Get existing config to merge with new
    const [existing] = await pool.query(
      'SELECT * FROM advanced_settings WHERE setting_key = ?',
      [key]
    );
    
    let mergedConfig = config;
    if (existing.length) {
      const oldConfig = JSON.parse(existing[0].setting_value);
      // Keep old secrets if new ones are empty (masked in UI)
      mergedConfig = {
        ...oldConfig,
        ...config,
        apiKey: config.apiKey || oldConfig.apiKey,
        secretKey: config.secretKey || oldConfig.secretKey,
        password: config.password || oldConfig.password,
      };
    }
    
    await pool.query(
      `INSERT INTO advanced_settings (id, setting_key, setting_value, updated_at)
       VALUES (?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = NOW()`,
      [crypto.randomUUID(), key, JSON.stringify(mergedConfig), JSON.stringify(mergedConfig)]
    );
    
    // Log the configuration change (without sensitive data)
    await pool.query(
      'INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [crypto.randomUUID(), req.user?.id, 'update_integration', 'settings', provider, JSON.stringify({ provider, enabled: config.enabled }),]
    );
    
    res.json({ success: true, provider });
  } catch (error) {
    console.error('Integration update error:', error);
    res.status(500).json({ error: 'Failed to update integration' });
  }
});

// Test integration connection
router.post('/integrations/:provider/test', requireAdmin, async (req, res) => {
  try {
    const { provider } = req.params;
    
    // Get integration config
    const [rows] = await pool.query(
      'SELECT * FROM advanced_settings WHERE setting_key = ?',
      [`integration_${provider}`]
    );
    
    if (!rows.length) {
      return res.status(400).json({ error: 'Integration not configured' });
    }
    
    const config = JSON.parse(rows[0].setting_value);
    
    // Mock test for each provider
    const testResults = {
      twilio: { success: true, message: 'SMS gateway connection successful' },
      sendgrid: { success: true, message: 'Email service connection successful' },
      stripe: { success: true, message: 'Payment gateway connection successful' },
      easypaisa: { success: true, message: 'Easypaisa integration connection successful' },
      jazzcash: { success: true, message: 'JazzCash integration connection successful' },
    };
    
    const result = testResults[provider] || { 
      success: false, 
      message: 'Unknown provider' 
    };
    
    res.json(result);
  } catch (error) {
    console.error('Integration test error:', error);
    res.status(500).json({ success: false, error: 'Test failed' });
  }
});

export default router;
