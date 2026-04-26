/* eslint-env node */
import express from 'express';
import crypto from 'crypto';
import pool from '../lib/db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get notifications for current user
router.get('/', requireAdmin, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    const [rows] = await pool.query(`
      SELECT * FROM notifications 
      WHERE user_id = ? OR user_id IS NULL
      ORDER BY created_at DESC
      LIMIT 50
    `, [userId]);
    
    const notifications = rows.map(n => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      entityType: n.entity_type,
      entityId: n.entity_id,
      isRead: n.is_read,
      createdAt: n.created_at
    }));
    
    res.json(notifications);
  } catch (error) {
    console.error('Notifications fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get unread count
router.get('/unread-count', requireAdmin, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    const [rows] = await pool.query(`
      SELECT COUNT(*) as count
      FROM notifications
      WHERE (user_id = ? OR user_id IS NULL) AND is_read = false
    `, [userId]);
    
    res.json({ count: rows[0].count });
  } catch (error) {
    console.error('Unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

// Mark as read
router.put('/:id/read', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query(
      'UPDATE notifications SET is_read = true WHERE id = ?',
      [id]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all as read
router.put('/read-all', requireAdmin, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    await pool.query(`
      UPDATE notifications 
      SET is_read = true 
      WHERE (user_id = ? OR user_id IS NULL) AND is_read = false
    `, [userId]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Create notification (internal use)
router.post('/', async (req, res) => {
  try {
    const { type, title, message, entityType, entityId, userId } = req.body;
    
    const id = crypto.randomUUID();
    const now = new Date();
    
    await pool.query(
      `INSERT INTO notifications (id, type, title, message, entity_type, entity_id, user_id, is_read, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, false, ?)`,
      [id, type, title, message, entityType || null, entityId || null, userId || null, now]
    );
    
    res.status(201).json({ id, type, title });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Delete notification
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM notifications WHERE id = ?', [id]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

export default router;
