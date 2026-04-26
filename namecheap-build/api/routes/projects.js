/* eslint-env node */
import express from 'express';
import crypto from 'crypto';
import pool from '../lib/db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all projects
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
    
    // Map database snake_case to camelCase and parse JSON
    const projects = rows.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      location: p.location,
      totalArea: p.total_area,
      status: p.status,
      images: JSON.parse(p.images || '[]'),
      features: JSON.parse(p.features || '[]'),
      launchDate: p.launch_date,
      completionDate: p.completion_date,
      startingPrice: p.starting_price,
      createdAt: p.created_at,
      updatedAt: p.updated_at
    }));

    res.json(projects);
  } catch (error) {
    console.error('Projects fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Create new project - Admin only
router.post('/', requireAdmin, async (req, res) => {
  try {
    const {
      name, slug, description, location, totalArea, status,
      images, features, launchDate, completionDate, startingPrice
    } = req.body;
    
    const id = crypto.randomUUID(); // Requires node 19+
    const now = new Date();

    await pool.query(
      `INSERT INTO projects (id, name, slug, description, location, total_area, status, images, features, launch_date, completion_date, starting_price, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, name, slug, description, location, totalArea, status || 'Active', 
        JSON.stringify(images || []), JSON.stringify(features || []),
        launchDate || null, completionDate || null, startingPrice || null,
        now, now
      ]
    );

    res.status(201).json({ id, name, slug });
  } catch (error) {
    console.error('Project create error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Get single project
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM projects WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const p = rows[0];
    const project = {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      location: p.location,
      totalArea: p.total_area,
      status: p.status,
      images: JSON.parse(p.images || '[]'),
      features: JSON.parse(p.features || '[]'),
      launchDate: p.launch_date,
      completionDate: p.completion_date,
      startingPrice: p.starting_price,
      createdAt: p.created_at,
      updatedAt: p.updated_at
    };
    
    res.json(project);
  } catch (error) {
    console.error('Project fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Update project - Admin only
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, slug, description, location, totalArea, status,
      images, features, launchDate, completionDate, startingPrice
    } = req.body;
    
    const now = new Date();
    
    await pool.query(
      `UPDATE projects SET name = ?, slug = ?, description = ?, location = ?, total_area = ?, status = ?, images = ?, features = ?, launch_date = ?, completion_date = ?, starting_price = ?, updated_at = ? WHERE id = ?`,
      [
        name, slug, description, location, totalArea, status,
        JSON.stringify(images || []), JSON.stringify(features || []),
        launchDate || null, completionDate || null, startingPrice || null,
        now, id
      ]
    );
    
    const [rows] = await pool.query('SELECT * FROM projects WHERE id = ?', [id]);
    const p = rows[0];
    const project = {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      location: p.location,
      totalArea: p.total_area,
      status: p.status,
      images: JSON.parse(p.images || '[]'),
      features: JSON.parse(p.features || '[]'),
      launchDate: p.launch_date,
      completionDate: p.completion_date,
      startingPrice: p.starting_price,
      createdAt: p.created_at,
      updatedAt: p.updated_at
    };
    
    res.json(project);
  } catch (error) {
    console.error('Project update error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project - Admin only
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM projects WHERE id = ?', [id]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Project delete error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;
