/* eslint-env node */
import express from 'express';
import crypto from 'crypto';
import pool from '../lib/db.js';
import { requireAdmin } from '../middleware/auth.js';
import { debug } from '../debug.js';

const router = express.Router();

// Safe JSON parse helper
function safeJSONParse(value, defaultValue = {}) {
  if (!value) return defaultValue;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return defaultValue;
  }
}

// Get all sections (optionally filter by page)
router.get('/', async (req, res) => {
  try {
    const { page } = req.query;
    
    let query = 'SELECT * FROM page_sections';
    let params = [];
    
    if (page) {
      query += ' WHERE page = ?';
      params.push(page);
    }
    
    query += ' ORDER BY page, display_order ASC';
    
    const [rows] = await pool.query(query, params);
    
    const sections = rows.map(s => ({
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
    }));
    
    res.json(sections);
  } catch (error) {
    console.error('Sections fetch error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: 'Failed to fetch sections', details: error.message });
  }
});

// Get sections for a specific page (grouped)
router.get('/page/:page', async (req, res) => {
  try {
    const { page } = req.params;
    debug(`/page/:page - page param: ${page}`);
    
    debug(`Executing query for page: ${page}`);
    const [rows] = await pool.query(
      'SELECT * FROM page_sections WHERE page = ? AND is_active = true ORDER BY display_order ASC',
      [page]
    );
    debug(`Query returned ${rows.length} rows`);
    
    debug('Starting mapping');
    const sections = rows.map((s, i) => {
      debug(`Mapping row ${i}: ${s.section_key}`);
      return {
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
    });
    debug('Mapping complete, sending response');
    
    res.json(sections);
  } catch (err) {
    console.error('Page sections fetch error:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({ error: 'Failed to fetch page sections', details: err.message });
  }
});

// Get single section
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.query('SELECT * FROM page_sections WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Section not found' });
    }
    
    const s = rows[0];
    const section = {
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
    
    res.json(section);
  } catch (error) {
    console.error('Section fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch section' });
  }
});

// Create new section - Admin only
router.post('/', requireAdmin, async (req, res) => {
  try {
    const {
      id,
      page,
      sectionKey,
      title,
      subtitle,
      content,
      images,
      buttons,
      displayOrder
    } = req.body;
    
    const sectionId = id || crypto.randomUUID();
    const now = new Date();
    
    await pool.query(
      `INSERT INTO page_sections (id, page, section_key, title, subtitle, content, images, buttons, display_order, is_active, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sectionId,
        page,
        sectionKey,
        title || null,
        subtitle || null,
        JSON.stringify(content || {}),
        JSON.stringify(images || []),
        JSON.stringify(buttons || []),
        displayOrder || 0,
        true,
        now,
        now
      ]
    );
    
    res.status(201).json({ 
      id: sectionId,
      page,
      sectionKey,
      message: 'Section created successfully'
    });
  } catch (error) {
    console.error('Section create error:', error);
    res.status(500).json({ error: 'Failed to create section' });
  }
});

// Update section - Admin only
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      page,
      sectionKey,
      title,
      subtitle,
      content,
      images,
      buttons,
      displayOrder,
      isActive
    } = req.body;
    
    const now = new Date();
    
    await pool.query(
      `UPDATE page_sections SET 
        page = ?, section_key = ?, title = ?, subtitle = ?, 
        content = ?, images = ?, buttons = ?, display_order = ?, is_active = ?, updated_at = ? 
       WHERE id = ?`,
      [
        page,
        sectionKey,
        title || null,
        subtitle || null,
        JSON.stringify(content || {}),
        JSON.stringify(images || []),
        JSON.stringify(buttons || []),
        displayOrder || 0,
        isActive !== undefined ? isActive : true,
        now,
        id
      ]
    );
    
    res.json({ id, message: 'Section updated successfully' });
  } catch (error) {
    console.error('Section update error:', error);
    res.status(500).json({ error: 'Failed to update section' });
  }
});

// Delete section - Admin only
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM page_sections WHERE id = ?', [id]);
    
    res.json({ success: true, message: 'Section deleted successfully' });
  } catch (error) {
    console.error('Section delete error:', error);
    res.status(500).json({ error: 'Failed to delete section' });
  }
});

// Reorder sections - Admin only
router.post('/reorder', requireAdmin, async (req, res) => {
  try {
    const { sections } = req.body; // Array of { id, displayOrder }
    
    if (!Array.isArray(sections)) {
      return res.status(400).json({ error: 'Invalid sections array' });
    }
    
    const now = new Date();
    
    // Update each section's order
    for (const section of sections) {
      await pool.query(
        'UPDATE page_sections SET display_order = ?, updated_at = ? WHERE id = ?',
        [section.displayOrder, now, section.id]
      );
    }
    
    res.json({ success: true, message: 'Sections reordered successfully' });
  } catch (error) {
    console.error('Section reorder error:', error);
    res.status(500).json({ error: 'Failed to reorder sections' });
  }
});

export default router;
