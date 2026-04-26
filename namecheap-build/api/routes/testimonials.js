/* eslint-env node */
import express from 'express';
import crypto from 'crypto';
import pool from '../lib/db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all testimonials - Public
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT testimonials.*, projects.name as project_name 
       FROM testimonials 
       LEFT JOIN projects ON testimonials.project_id = projects.id
       ORDER BY testimonials.created_at DESC`
    );
    
    const testimonials = rows.map(t => ({
      id: t.id,
      customerName: t.customer_name,
      customerImage: t.customer_image,
      testimonial: t.testimonial,
      rating: t.rating,
      projectId: t.project_id,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
      projectName: t.project_name
    }));
    
    res.json(testimonials);
  } catch (error) {
    console.error('Testimonials fetch error:', error);
    if (process.env.NODE_ENV !== 'production') {
      return res.json([]);
    }
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

// Get single testimonial - Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.query(
      `SELECT testimonials.*, projects.name as project_name 
       FROM testimonials 
       LEFT JOIN projects ON testimonials.project_id = projects.id
       WHERE testimonials.id = ?`,
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }
    
    const t = rows[0];
    const testimonial = {
      id: t.id,
      customerName: t.customer_name,
      customerImage: t.customer_image,
      testimonial: t.testimonial,
      rating: t.rating,
      projectId: t.project_id,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
      projectName: t.project_name
    };
    
    res.json(testimonial);
  } catch (error) {
    console.error('Testimonial fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch testimonial' });
  }
});

// Create new testimonial - Admin only
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { customerName, customerImage, testimonial, rating, projectId } = req.body;
    
    const id = crypto.randomUUID();
    const now = new Date();
    
    await pool.query(
      `INSERT INTO testimonials (id, customer_name, customer_image, testimonial, rating, project_id, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, customerName, customerImage || null, testimonial, rating || 5,
        projectId || null, now, now
      ]
    );
    
    res.status(201).json({ id, customerName, rating: rating || 5 });
  } catch (error) {
    console.error('Testimonial create error:', error);
    res.status(500).json({ error: 'Failed to create testimonial' });
  }
});

// Update testimonial - Admin only
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { customerName, customerImage, testimonial, rating, projectId } = req.body;
    
    const now = new Date();
    
    await pool.query(
      `UPDATE testimonials SET customer_name = ?, customer_image = ?, testimonial = ?, rating = ?, project_id = ?, updated_at = ? WHERE id = ?`,
      [customerName, customerImage || null, testimonial, rating, projectId || null, now, id]
    );
    
    const [rows] = await pool.query('SELECT * FROM testimonials WHERE id = ?', [id]);
    const t = rows[0];
    const result = {
      id: t.id,
      customerName: t.customer_name,
      customerImage: t.customer_image,
      testimonial: t.testimonial,
      rating: t.rating,
      projectId: t.project_id,
      createdAt: t.created_at,
      updatedAt: t.updated_at
    };
    
    res.json(result);
  } catch (error) {
    console.error('Testimonial update error:', error);
    res.status(500).json({ error: 'Failed to update testimonial' });
  }
});

// Delete testimonial - Admin only
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM testimonials WHERE id = ?', [id]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Testimonial delete error:', error);
    res.status(500).json({ error: 'Failed to delete testimonial' });
  }
});

export default router;
