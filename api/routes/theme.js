/* eslint-env node */
import express from 'express';
import pool from '../lib/db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get theme settings
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM theme_settings WHERE id = 1');
    
    if (rows.length === 0) {
      // Insert default if not exists
      await pool.query('INSERT INTO theme_settings (id) VALUES (1)');
      const [newRows] = await pool.query('SELECT * FROM theme_settings WHERE id = 1');
      return res.json(formatTheme(newRows[0]));
    }
    
    res.json(formatTheme(rows[0]));
  } catch (error) {
    console.error('Theme fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch theme settings' });
  }
});

// Update theme settings - Admin only
router.put('/', requireAdmin, async (req, res) => {
  try {
    const updates = req.body;
    const allowedFields = [
      'primary_color', 'primary_hover', 'primary_light',
      'secondary_color', 'secondary_hover',
      'background_main', 'background_alt', 'background_dark',
      'text_primary', 'text_secondary', 'text_light', 'text_white',
      'border_light', 'border_medium',
      'accent_success', 'accent_warning', 'accent_error',
      'font_family', 'font_heading',
      'logo_url', 'logo_dark_url', 'favicon_url'
    ];
    
    // Build update query
    const setClause = [];
    const values = [];
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        setClause.push(`${field} = ?`);
        values.push(updates[field]);
      }
    }
    
    if (setClause.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    await pool.query(
      `UPDATE theme_settings SET ${setClause.join(', ')}, updated_at = NOW() WHERE id = 1`,
      values
    );
    
    // Return updated theme
    const [rows] = await pool.query('SELECT * FROM theme_settings WHERE id = 1');
    res.json(formatTheme(rows[0]));
  } catch (error) {
    console.error('Theme update error:', error);
    res.status(500).json({ error: 'Failed to update theme settings' });
  }
});

// Helper function to format theme data
function formatTheme(row) {
  return {
    colors: {
      primary: row.primary_color,
      primaryHover: row.primary_hover,
      primaryLight: row.primary_light,
      secondary: row.secondary_color,
      secondaryHover: row.secondary_hover,
      background: {
        main: row.background_main,
        alt: row.background_alt,
        dark: row.background_dark
      },
      text: {
        primary: row.text_primary,
        secondary: row.text_secondary,
        light: row.text_light,
        white: row.text_white
      },
      border: {
        light: row.border_light,
        medium: row.border_medium
      },
      accent: {
        success: row.accent_success,
        warning: row.accent_warning,
        error: row.accent_error
      }
    },
    typography: {
      fontFamily: row.font_family,
      fontHeading: row.font_heading
    },
    assets: {
      logoUrl: row.logo_url,
      logoDarkUrl: row.logo_dark_url,
      faviconUrl: row.favicon_url
    },
    updatedAt: row.updated_at
  };
}

export default router;
