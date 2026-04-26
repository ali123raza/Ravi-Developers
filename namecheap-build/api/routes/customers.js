import express from 'express';
import crypto from 'crypto';
import pool from '../lib/db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all customers
router.get('/', requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.*, 
        COUNT(DISTINCT b.id) as totalBookings,
        COALESCE(SUM(p.amount), 0) as totalPayments
      FROM customers c
      LEFT JOIN bookings b ON c.id = b.customer_id
      LEFT JOIN payments p ON b.id = p.booking_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    
    const customers = rows.map(c => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      address: c.address,
      notes: c.notes,
      source: c.source,
      status: c.status,
      totalBookings: c.totalBookings,
      totalPayments: c.totalPayments,
      createdAt: c.created_at,
      updatedAt: c.updated_at
    }));
    
    res.json(customers);
  } catch (error) {
    console.error('Customers fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Get single customer
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.query(
      'SELECT * FROM customers WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    const c = rows[0];
    
    // Get customer's bookings
    const [bookingRows] = await pool.query(`
      SELECT b.*, p.plot_number, pr.name as project_name
      FROM bookings b
      LEFT JOIN plots p ON b.plot_id = p.id
      LEFT JOIN projects pr ON p.project_id = pr.id
      WHERE b.customer_id = ?
      ORDER BY b.created_at DESC
    `, [id]);
    
    // Get customer's inquiries
    const [inquiryRows] = await pool.query(
      'SELECT * FROM inquiries WHERE customer_id = ? ORDER BY created_at DESC',
      [id]
    );
    
    res.json({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      address: c.address,
      notes: c.notes,
      source: c.source,
      status: c.status,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
      bookings: bookingRows.map(b => ({
        id: b.id,
        plotId: b.plot_id,
        plotNumber: b.plot_number,
        projectName: b.project_name,
        status: b.status,
        totalAmount: b.total_amount,
        paidAmount: b.paid_amount,
        createdAt: b.created_at
      })),
      inquiries: inquiryRows.map(i => ({
        id: i.id,
        status: i.status,
        message: i.message,
        createdAt: i.created_at
      }))
    });
  } catch (error) {
    console.error('Customer fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// Create customer
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, email, phone, address, notes, source } = req.body;
    
    const id = crypto.randomUUID();
    const now = new Date();
    
    await pool.query(
      `INSERT INTO customers (id, name, email, phone, address, notes, source, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
      [id, name, email, phone, address || null, notes || null, source || 'manual', now, now]
    );
    
    res.status(201).json({
      id,
      name,
      email,
      phone,
      address,
      notes,
      source: source || 'manual',
      status: 'active'
    });
  } catch (error) {
    console.error('Customer create error:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Update customer
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, notes, status } = req.body;
    
    const now = new Date();
    
    await pool.query(
      `UPDATE customers SET name = ?, email = ?, phone = ?, address = ?, notes = ?, status = ?, updated_at = ? WHERE id = ?`,
      [name, email, phone, address, notes, status, now, id]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Customer update error:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// Delete customer
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM customers WHERE id = ?', [id]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Customer delete error:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

// Convert inquiry to customer
router.post('/from-inquiry/:inquiryId', requireAdmin, async (req, res) => {
  try {
    const { inquiryId } = req.params;
    
    // Get inquiry details
    const [inquiryRows] = await pool.query(
      'SELECT * FROM inquiries WHERE id = ?',
      [inquiryId]
    );
    
    if (inquiryRows.length === 0) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }
    
    const inquiry = inquiryRows[0];
    
    // Check if customer already exists with this email
    const [existingRows] = await pool.query(
      'SELECT id FROM customers WHERE email = ?',
      [inquiry.email]
    );
    
    if (existingRows.length > 0) {
      // Link inquiry to existing customer
      await pool.query(
        'UPDATE inquiries SET customer_id = ? WHERE id = ?',
        [existingRows[0].id, inquiryId]
      );
      return res.json({ id: existingRows[0].id, existing: true });
    }
    
    // Create new customer from inquiry
    const id = crypto.randomUUID();
    const now = new Date();
    
    await pool.query(
      `INSERT INTO customers (id, name, email, phone, notes, source, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'inquiry', 'active', ?, ?)`,
      [id, inquiry.name, inquiry.email, inquiry.phone, inquiry.notes || inquiry.message, now, now]
    );
    
    // Link inquiry to new customer
    await pool.query(
      'UPDATE inquiries SET customer_id = ? WHERE id = ?',
      [id, inquiryId]
    );
    
    res.status(201).json({
      id,
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
      source: 'inquiry'
    });
  } catch (error) {
    console.error('Customer from inquiry error:', error);
    res.status(500).json({ error: 'Failed to convert inquiry to customer' });
  }
});

export default router;
