/* eslint-env node */
import express from 'express';
import crypto from 'crypto';
import pool from '../lib/db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all plots (with optional project filter)
router.get('/', async (req, res) => {
  try {
    const { projectId } = req.query;
    
    let query = `
      SELECT p.*, pr.name as projectName 
      FROM plots p
      LEFT JOIN projects pr ON p.project_id = pr.id
    `;
    const params = [];
    
    if (projectId) {
      query += ' WHERE p.project_id = ?';
      params.push(projectId);
    }
    
    query += ' ORDER BY p.created_at DESC';
    
    const [rows] = await pool.query(query, params);
    
    const plots = rows.map(plot => ({
      id: plot.id,
      plotNumber: plot.plot_number,
      projectId: plot.project_id,
      projectName: plot.projectName,
      size: plot.size,
      type: plot.type,
      price: plot.price,
      status: plot.status,
      isCorner: plot.is_corner,
      description: plot.description,
      createdAt: plot.created_at,
      updatedAt: plot.updated_at
    }));
    
    res.json(plots);
  } catch (error) {
    console.error('Plots fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch plots' });
  }
});

// Get single plot
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.query(
      `SELECT plots.*, projects.name as project_name 
       FROM plots 
       LEFT JOIN projects ON plots.project_id = projects.id 
       WHERE plots.id = ?`,
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Plot not found' });
    }
    
    const p = rows[0];
    const plot = {
      id: p.id,
      projectId: p.project_id,
      plotNumber: p.plot_number,
      size: p.size,
      type: p.type,
      price: p.price,
      status: p.status,
      area: p.area,
      facing: p.facing,
      category: p.category,
      isCorner: p.is_corner,
      mapBlock: p.map_block,
      mapRow: p.map_row,
      mapCol: p.map_col,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      projectName: p.project_name
    };
    
    res.json(plot);
  } catch (error) {
    console.error('Plot fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch plot' });
  }
});

// Create new plot - Admin only
router.post('/', requireAdmin, async (req, res) => {
  try {
    const {
      projectId, plotNumber, size, type, price, status,
      area, facing, category, isCorner, mapBlock, mapRow, mapCol
    } = req.body;
    
    const id = crypto.randomUUID();
    const now = new Date();

    await pool.query(
      `INSERT INTO plots (id, project_id, plot_number, size, type, price, status, area, facing, category, is_corner, map_block, map_row, map_col, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, projectId, plotNumber, size, type, price, status || 'Available',
        area, facing || null, category || null, isCorner || false,
        mapBlock || null, mapRow || null, mapCol || null,
        now, now
      ]
    );
    
    res.status(201).json({ id, projectId, plotNumber });
  } catch (error) {
    console.error('Plot create error:', error);
    res.status(500).json({ error: 'Failed to create plot' });
  }
});

// Update plot - Admin only
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      projectId, plotNumber, size, type, price, status,
      area, facing, category, isCorner, mapBlock, mapRow, mapCol
    } = req.body;
    
    const now = new Date();
    
    await pool.query(
      `UPDATE plots SET project_id = ?, plot_number = ?, size = ?, type = ?, price = ?, status = ?, area = ?, facing = ?, category = ?, is_corner = ?, map_block = ?, map_row = ?, map_col = ?, updated_at = ? WHERE id = ?`,
      [
        projectId, plotNumber, size, type, price, status,
        area, facing, category, isCorner, mapBlock, mapRow, mapCol,
        now, id
      ]
    );
    
    const [rows] = await pool.query('SELECT * FROM plots WHERE id = ?', [id]);
    const p = rows[0];
    const plot = {
      id: p.id,
      projectId: p.project_id,
      plotNumber: p.plot_number,
      size: p.size,
      type: p.type,
      price: p.price,
      status: p.status,
      area: p.area,
      facing: p.facing,
      category: p.category,
      isCorner: p.is_corner,
      mapBlock: p.map_block,
      mapRow: p.map_row,
      mapCol: p.map_col,
      createdAt: p.created_at,
      updatedAt: p.updated_at
    };
    
    res.json(plot);
  } catch (error) {
    console.error('Plot update error:', error);
    res.status(500).json({ error: 'Failed to update plot' });
  }
});

// Delete plot - Admin only
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM plots WHERE id = ?', [id]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Plot delete error:', error);
    res.status(500).json({ error: 'Failed to delete plot' });
  }
});

export default router;
