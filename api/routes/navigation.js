/* eslint-env node */
import express from 'express';
import crypto from 'crypto';
import pool from '../lib/db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all navigation items (public)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM navigation WHERE is_active = true ORDER BY parent_id IS NULL DESC, display_order ASC'
    );
    
    // Build tree structure
    const items = rows.map(n => ({
      id: n.id,
      label: n.label,
      href: n.href,
      parentId: n.parent_id,
      displayOrder: n.display_order,
      isActive: n.is_active,
      isExternal: n.is_external,
      icon: n.icon,
      children: []
    }));
    
    // Group children under parents
    const rootItems = [];
    const itemMap = new Map();
    
    items.forEach(item => {
      itemMap.set(item.id, item);
      if (!item.parentId) {
        rootItems.push(item);
      }
    });
    
    items.forEach(item => {
      if (item.parentId && itemMap.has(item.parentId)) {
        itemMap.get(item.parentId).children.push(item);
      }
    });
    
    res.json(rootItems);
  } catch (error) {
    console.error('Navigation fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch navigation' });
  }
});

// Get flat list (for admin editing)
router.get('/flat', requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM navigation ORDER BY parent_id IS NULL DESC, display_order ASC'
    );
    
    const items = rows.map(n => ({
      id: n.id,
      label: n.label,
      href: n.href,
      parentId: n.parent_id,
      displayOrder: n.display_order,
      isActive: n.is_active,
      isExternal: n.is_external,
      icon: n.icon
    }));
    
    res.json(items);
  } catch (error) {
    console.error('Navigation flat fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch navigation' });
  }
});

// Get single navigation item
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.query('SELECT * FROM navigation WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Navigation item not found' });
    }
    
    const n = rows[0];
    res.json({
      id: n.id,
      label: n.label,
      href: n.href,
      parentId: n.parent_id,
      displayOrder: n.display_order,
      isActive: n.is_active,
      isExternal: n.is_external,
      icon: n.icon
    });
  } catch (error) {
    console.error('Navigation fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch navigation item' });
  }
});

// Create navigation item - Admin only
router.post('/', requireAdmin, async (req, res) => {
  try {
    const {
      id,
      label,
      href,
      parentId,
      displayOrder,
      isExternal,
      icon
    } = req.body;
    
    const navId = id || crypto.randomUUID();
    
    await pool.query(
      `INSERT INTO navigation (id, label, href, parent_id, display_order, is_active, is_external, icon) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        navId,
        label,
        href,
        parentId || null,
        displayOrder || 0,
        true,
        isExternal || false,
        icon || null
      ]
    );
    
    res.status(201).json({
      id: navId,
      label,
      href,
      message: 'Navigation item created successfully'
    });
  } catch (error) {
    console.error('Navigation create error:', error);
    res.status(500).json({ error: 'Failed to create navigation item' });
  }
});

// Update navigation item - Admin only
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      label,
      href,
      parentId,
      displayOrder,
      isActive,
      isExternal,
      icon
    } = req.body;
    
    await pool.query(
      `UPDATE navigation SET 
        label = ?, href = ?, parent_id = ?, display_order = ?, 
        is_active = ?, is_external = ?, icon = ? 
       WHERE id = ?`,
      [
        label,
        href,
        parentId || null,
        displayOrder !== undefined ? displayOrder : 0,
        isActive !== undefined ? isActive : true,
        isExternal !== undefined ? isExternal : false,
        icon || null,
        id
      ]
    );
    
    res.json({ id, message: 'Navigation item updated successfully' });
  } catch (error) {
    console.error('Navigation update error:', error);
    res.status(500).json({ error: 'Failed to update navigation item' });
  }
});

// Delete navigation item - Admin only
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM navigation WHERE id = ?', [id]);
    
    res.json({ success: true, message: 'Navigation item deleted successfully' });
  } catch (error) {
    console.error('Navigation delete error:', error);
    res.status(500).json({ error: 'Failed to delete navigation item' });
  }
});

// Reorder navigation items - Admin only
router.post('/reorder', requireAdmin, async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, displayOrder }
    
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid items array' });
    }
    
    for (const item of items) {
      await pool.query(
        'UPDATE navigation SET display_order = ? WHERE id = ?',
        [item.displayOrder, item.id]
      );
    }
    
    res.json({ success: true, message: 'Navigation items reordered successfully' });
  } catch (error) {
    console.error('Navigation reorder error:', error);
    res.status(500).json({ error: 'Failed to reorder navigation items' });
  }
});

export default router;
