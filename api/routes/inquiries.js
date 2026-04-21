import express from 'express';
import pool from '../lib/db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all inquiries - Admin only
router.get('/', requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT inquiries.*, projects.name as project_name, plots.plot_number as plot_number
       FROM inquiries 
       LEFT JOIN projects ON inquiries.project_id = projects.id
       LEFT JOIN plots ON inquiries.plot_id = plots.id
       ORDER BY inquiries.created_at DESC`
    );
    
    const inquiries = rows.map(i => ({
      id: i.id,
      name: i.name,
      email: i.email,
      phone: i.phone,
      message: i.message,
      projectId: i.project_id,
      plotId: i.plot_id,
      status: i.status,
      notes: i.notes,
      createdAt: i.created_at,
      updatedAt: i.updated_at,
      projectName: i.project_name,
      plotNumber: i.plot_number
    }));
    
    res.json(inquiries);
  } catch (error) {
    console.error('Inquiries fetch error:', error);
    if (process.env.NODE_ENV !== 'production') {
      return res.json([]);
    }
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
});

// Get single inquiry - Admin only
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.query(
      `SELECT inquiries.*, projects.name as project_name, plots.plot_number as plot_number
       FROM inquiries 
       LEFT JOIN projects ON inquiries.project_id = projects.id
       LEFT JOIN plots ON inquiries.plot_id = plots.id
       WHERE inquiries.id = ?`,
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }
    
    const i = rows[0];
    const inquiry = {
      id: i.id,
      name: i.name,
      email: i.email,
      phone: i.phone,
      message: i.message,
      projectId: i.project_id,
      plotId: i.plot_id,
      status: i.status,
      notes: i.notes,
      createdAt: i.created_at,
      updatedAt: i.updated_at,
      projectName: i.project_name,
      plotNumber: i.plot_number
    };
    
    res.json(inquiry);
  } catch (error) {
    console.error('Inquiry fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch inquiry' });
  }
});

// Create new inquiry - Public
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message, projectId, plotId } = req.body;
    
    const id = crypto.randomUUID();
    const now = new Date();
    
    await pool.query(
      `INSERT INTO inquiries (id, name, email, phone, message, project_id, plot_id, status, notes, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, name, email, phone, message || null, projectId || null, plotId || null,
        'New', null, now, now
      ]
    );
    
    res.status(201).json({ id, name, email, status: 'New' });
  } catch (error) {
    console.error('Inquiry create error:', error);
    res.status(500).json({ error: 'Failed to create inquiry' });
  }
});

// Update inquiry - Admin only
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const now = new Date();
    
    await pool.query(
      `UPDATE inquiries SET status = ?, notes = ?, updated_at = ? WHERE id = ?`,
      [status, notes || null, now, id]
    );
    
    const [rows] = await pool.query('SELECT * FROM inquiries WHERE id = ?', [id]);
    const i = rows[0];
    const inquiry = {
      id: i.id,
      name: i.name,
      email: i.email,
      phone: i.phone,
      message: i.message,
      projectId: i.project_id,
      plotId: i.plot_id,
      status: i.status,
      notes: i.notes,
      createdAt: i.created_at,
      updatedAt: i.updated_at
    };
    
    res.json(inquiry);
  } catch (error) {
    console.error('Inquiry update error:', error);
    res.status(500).json({ error: 'Failed to update inquiry' });
  }
});

// Delete inquiry - Admin only
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM inquiries WHERE id = ?', [id]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Inquiry delete error:', error);
    res.status(500).json({ error: 'Failed to delete inquiry' });
  }
});

export default router;
