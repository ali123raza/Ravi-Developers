/* eslint-env node */
import express from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import pool from '../lib/db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all users - Admin only
router.get('/', requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, email, name, role, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    
    const users = rows.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      createdAt: u.created_at,
      updatedAt: u.updated_at
    }));
    
    res.json(users);
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get single user - Admin only
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.query(
      'SELECT id, email, name, role, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const u = rows[0];
    res.json({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      createdAt: u.created_at,
      updatedAt: u.updated_at
    });
  } catch (error) {
    console.error('User fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create new user - Admin only
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    
    const id = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash(password, 10);
    const now = new Date();
    
    await pool.query(
      `INSERT INTO users (id, email, password, name, role, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, email, hashedPassword, name, role || 'user', now, now]
    );
    
    res.status(201).json({ id, email, name, role: role || 'user' });
  } catch (error) {
    console.error('User create error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user - Admin only
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, role, password } = req.body;
    
    const now = new Date();
    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        `UPDATE users SET email = ?, password = ?, name = ?, role = ?, updated_at = ? WHERE id = ?`,
        [email, hashedPassword, name, role, now, id]
      );
    } else {
      await pool.query(
        `UPDATE users SET email = ?, name = ?, role = ?, updated_at = ? WHERE id = ?`,
        [email, name, role, now, id]
      );
    }
    
    const [rows] = await pool.query(
      'SELECT id, email, name, role, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    
    const u = rows[0];
    res.json({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      createdAt: u.created_at,
      updatedAt: u.updated_at
    });
  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user - Admin only
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('User delete error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
