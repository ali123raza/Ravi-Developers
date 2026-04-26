/* eslint-env node */
import express from 'express';
import pool from '../lib/db.js';
import { requireAdmin } from '../middleware/auth.js';
import crypto from 'crypto';

const router = express.Router();

// Email Campaigns
router.get('/campaigns', requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM email_campaigns ORDER BY created_at DESC'
    );
    
    const campaigns = rows.map(c => ({
      id: c.id,
      name: c.name,
      subject: c.subject,
      content: c.content,
      recipientType: c.recipient_type,
      recipientCount: c.recipient_count,
      sentCount: c.sent_count,
      status: c.status,
      scheduledAt: c.scheduled_at,
      sentAt: c.sent_at,
      createdAt: c.created_at,
    }));
    
    res.json(campaigns);
  } catch (error) {
    console.error('Campaigns fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

router.post('/campaigns', requireAdmin, async (req, res) => {
  try {
    const { name, subject, content, recipientType, scheduledAt } = req.body;
    const id = crypto.randomUUID();
    
    // Count recipients
    let recipientCount = 0;
    if (recipientType === 'all') {
      const [customers] = await pool.query('SELECT COUNT(*) as count FROM customers WHERE email IS NOT NULL');
      const [inquiries] = await pool.query('SELECT COUNT(*) as count FROM inquiries WHERE email IS NOT NULL');
      recipientCount = customers[0].count + inquiries[0].count;
    } else if (recipientType === 'customers') {
      const [rows] = await pool.query('SELECT COUNT(*) as count FROM customers WHERE email IS NOT NULL');
      recipientCount = rows[0].count;
    } else if (recipientType === 'inquiries') {
      const [rows] = await pool.query('SELECT COUNT(*) as count FROM inquiries WHERE email IS NOT NULL');
      recipientCount = rows[0].count;
    }
    
    await pool.query(
      `INSERT INTO email_campaigns (id, name, subject, content, recipient_type, recipient_count, status, scheduled_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [id, name, subject, content, recipientType, recipientCount, scheduledAt ? 'scheduled' : 'draft', scheduledAt || null]
    );
    
    res.status(201).json({ id, name, recipientCount, status: scheduledAt ? 'scheduled' : 'draft' });
  } catch (error) {
    console.error('Campaign create error:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

router.put('/campaigns/:id/send', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get campaign
    const [campaigns] = await pool.query('SELECT * FROM email_campaigns WHERE id = ?', [id]);
    if (!campaigns.length) return res.status(404).json({ error: 'Campaign not found' });
    
    const campaign = campaigns[0];
    
    // Get recipients based on type
    let recipients = [];
    if (campaign.recipient_type === 'all') {
      const [customers] = await pool.query('SELECT email, name FROM customers WHERE email IS NOT NULL');
      const [inquiries] = await pool.query('SELECT email, name FROM inquiries WHERE email IS NOT NULL');
      recipients = [...customers, ...inquiries];
    } else if (campaign.recipient_type === 'customers') {
      const [rows] = await pool.query('SELECT email, name FROM customers WHERE email IS NOT NULL');
      recipients = rows;
    } else if (campaign.recipient_type === 'inquiries') {
      const [rows] = await pool.query('SELECT email, name FROM inquiries WHERE email IS NOT NULL');
      recipients = rows;
    }
    
    // Mock send (in production, use a real email service like SendGrid, AWS SES)
    const sentCount = recipients.length;
    
    await pool.query(
      'UPDATE email_campaigns SET status = ?, sent_count = ?, sent_at = NOW() WHERE id = ?',
      ['sent', sentCount, id]
    );
    
    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [crypto.randomUUID(), req.user?.id, 'send_campaign', 'campaign', id, JSON.stringify({ recipients: sentCount }),]
    );
    
    res.json({ success: true, sentCount });
  } catch (error) {
    console.error('Campaign send error:', error);
    res.status(500).json({ error: 'Failed to send campaign' });
  }
});

router.delete('/campaigns/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM email_campaigns WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Campaign delete error:', error);
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
});

// SMS Campaigns
router.get('/sms', requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM sms_campaigns ORDER BY created_at DESC'
    );
    
    const campaigns = rows.map(c => ({
      id: c.id,
      name: c.name,
      message: c.message,
      recipientType: c.recipient_type,
      recipientCount: c.recipient_count,
      sentCount: c.sent_count,
      status: c.status,
      sentAt: c.sent_at,
      createdAt: c.created_at,
    }));
    
    res.json(campaigns);
  } catch (error) {
    console.error('SMS campaigns fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch SMS campaigns' });
  }
});

router.post('/sms', requireAdmin, async (req, res) => {
  try {
    const { name, message, recipientType } = req.body;
    const id = crypto.randomUUID();
    
    // Count recipients
    let recipientCount = 0;
    if (recipientType === 'all') {
      const [customers] = await pool.query('SELECT COUNT(*) as count FROM customers WHERE phone IS NOT NULL');
      const [inquiries] = await pool.query('SELECT COUNT(*) as count FROM inquiries WHERE phone IS NOT NULL');
      recipientCount = customers[0].count + inquiries[0].count;
    } else if (recipientType === 'customers') {
      const [rows] = await pool.query('SELECT COUNT(*) as count FROM customers WHERE phone IS NOT NULL');
      recipientCount = rows[0].count;
    } else if (recipientType === 'inquiries') {
      const [rows] = await pool.query('SELECT COUNT(*) as count FROM inquiries WHERE phone IS NOT NULL');
      recipientCount = rows[0].count;
    }
    
    await pool.query(
      `INSERT INTO sms_campaigns (id, name, message, recipient_type, recipient_count, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [id, name, message, recipientType, recipientCount, 'draft']
    );
    
    res.status(201).json({ id, name, recipientCount, status: 'draft' });
  } catch (error) {
    console.error('SMS campaign create error:', error);
    res.status(500).json({ error: 'Failed to create SMS campaign' });
  }
});

router.put('/sms/:id/send', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [campaigns] = await pool.query('SELECT * FROM sms_campaigns WHERE id = ?', [id]);
    if (!campaigns.length) return res.status(404).json({ error: 'Campaign not found' });
    
    const campaign = campaigns[0];
    
    // Get recipients
    let recipients = [];
    if (campaign.recipient_type === 'all') {
      const [customers] = await pool.query('SELECT phone FROM customers WHERE phone IS NOT NULL');
      const [inquiries] = await pool.query('SELECT phone FROM inquiries WHERE phone IS NOT NULL');
      recipients = [...customers, ...inquiries];
    } else if (campaign.recipient_type === 'customers') {
      const [rows] = await pool.query('SELECT phone FROM customers WHERE phone IS NOT NULL');
      recipients = rows;
    } else if (campaign.recipient_type === 'inquiries') {
      const [rows] = await pool.query('SELECT phone FROM inquiries WHERE phone IS NOT NULL');
      recipients = rows;
    }
    
    // Mock send (in production, integrate with Twilio, MessageBird, etc.)
    const sentCount = recipients.length;
    
    await pool.query(
      'UPDATE sms_campaigns SET status = ?, sent_count = ?, sent_at = NOW() WHERE id = ?',
      ['sent', sentCount, id]
    );
    
    res.json({ success: true, sentCount });
  } catch (error) {
    console.error('SMS send error:', error);
    res.status(500).json({ error: 'Failed to send SMS' });
  }
});

router.delete('/sms/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM sms_campaigns WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('SMS campaign delete error:', error);
    res.status(500).json({ error: 'Failed to delete SMS campaign' });
  }
});

// Promotions/Offers
router.get('/promotions', requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM promotions ORDER BY created_at DESC'
    );
    
    const promotions = rows.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      code: p.code,
      discountType: p.discount_type,
      discountValue: p.discount_value,
      minBookingAmount: p.min_booking_amount,
      validFrom: p.valid_from,
      validUntil: p.valid_until,
      maxUses: p.max_uses,
      usedCount: p.used_count,
      isActive: p.is_active,
      createdAt: p.created_at,
    }));
    
    res.json(promotions);
  } catch (error) {
    console.error('Promotions fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch promotions' });
  }
});

router.post('/promotions', requireAdmin, async (req, res) => {
  try {
    const { title, description, code, discountType, discountValue, minBookingAmount, validFrom, validUntil, maxUses } = req.body;
    const id = crypto.randomUUID();
    
    await pool.query(
      `INSERT INTO promotions (id, title, description, code, discount_type, discount_value, min_booking_amount, valid_from, valid_until, max_uses, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [id, title, description, code, discountType, discountValue, minBookingAmount || 0, validFrom, validUntil, maxUses || null, true]
    );
    
    res.status(201).json({ id, title, code });
  } catch (error) {
    console.error('Promotion create error:', error);
    res.status(500).json({ error: 'Failed to create promotion' });
  }
});

router.put('/promotions/:id', requireAdmin, async (req, res) => {
  try {
    const { isActive } = req.body;
    await pool.query(
      'UPDATE promotions SET is_active = ? WHERE id = ?',
      [isActive, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Promotion update error:', error);
    res.status(500).json({ error: 'Failed to update promotion' });
  }
});

router.delete('/promotions/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM promotions WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Promotion delete error:', error);
    res.status(500).json({ error: 'Failed to delete promotion' });
  }
});

export default router;
