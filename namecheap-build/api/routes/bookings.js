import express from 'express';
import crypto from 'crypto';
import pool from '../lib/db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all bookings
router.get('/', requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT b.*, 
        p.name as plotNumber, 
        pr.name as projectName,
        c.name as customerName,
        c.phone as customerPhone
      FROM bookings b
      LEFT JOIN plots p ON b.plot_id = p.id
      LEFT JOIN projects pr ON p.project_id = pr.id
      LEFT JOIN customers c ON b.customer_id = c.id
      ORDER BY b.created_at DESC
    `);
    
    const bookings = rows.map(b => ({
      id: b.id,
      plotId: b.plot_id,
      plotNumber: b.plotNumber,
      projectName: b.projectName,
      customerId: b.customer_id,
      customerName: b.customerName,
      customerPhone: b.customerPhone,
      status: b.status,
      paymentStatus: b.payment_status,
      totalAmount: b.total_amount,
      paidAmount: b.paid_amount,
      installmentCount: b.installment_count,
      notes: b.notes,
      createdAt: b.created_at,
      updatedAt: b.updated_at
    }));
    
    res.json(bookings);
  } catch (error) {
    console.error('Bookings fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get single booking
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [bookingRows] = await pool.query(`
      SELECT b.*, 
        p.name as plotNumber, 
        pr.name as projectName,
        c.name as customerName,
        c.phone as customerPhone,
        c.email as customerEmail
      FROM bookings b
      LEFT JOIN plots p ON b.plot_id = p.id
      LEFT JOIN projects pr ON p.project_id = pr.id
      LEFT JOIN customers c ON b.customer_id = c.id
      WHERE b.id = ?
    `, [id]);
    
    if (bookingRows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    const booking = bookingRows[0];
    
    // Get payments
    const [paymentRows] = await pool.query(
      'SELECT * FROM payments WHERE booking_id = ? ORDER BY payment_date DESC',
      [id]
    );
    
    res.json({
      id: booking.id,
      plotId: booking.plot_id,
      plotNumber: booking.plotNumber,
      projectName: booking.projectName,
      customerId: booking.customer_id,
      customerName: booking.customerName,
      customerPhone: booking.customerPhone,
      customerEmail: booking.customerEmail,
      status: booking.status,
      paymentStatus: booking.payment_status,
      totalAmount: booking.total_amount,
      paidAmount: booking.paid_amount,
      installmentCount: booking.installment_count,
      notes: booking.notes,
      createdAt: booking.created_at,
      updatedAt: booking.updated_at,
      payments: paymentRows.map(p => ({
        id: p.id,
        amount: p.amount,
        paymentDate: p.payment_date,
        paymentMethod: p.payment_method,
        receiptUrl: p.receipt_url,
        notes: p.notes,
        createdAt: p.created_at
      }))
    });
  } catch (error) {
    console.error('Booking fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// Create booking
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { plotId, customerId, totalAmount, installmentCount, notes } = req.body;
    
    const id = crypto.randomUUID();
    const now = new Date();
    
    await pool.query(
      `INSERT INTO bookings (id, plot_id, customer_id, status, payment_status, total_amount, paid_amount, installment_count, notes, created_at, updated_at)
       VALUES (?, ?, ?, 'pending', 'pending', ?, 0, ?, ?, ?, ?)`,
      [id, plotId, customerId, totalAmount, installmentCount || 1, notes || null, now, now]
    );
    
    // Update plot status to reserved
    await pool.query(
      "UPDATE plots SET status = 'Reserved' WHERE id = ?",
      [plotId]
    );
    
    res.status(201).json({ 
      id, 
      plotId, 
      customerId, 
      status: 'pending',
      paymentStatus: 'pending',
      totalAmount,
      paidAmount: 0,
      installmentCount: installmentCount || 1
    });
  } catch (error) {
    console.error('Booking create error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Update booking
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, notes } = req.body;
    
    const now = new Date();
    
    await pool.query(
      `UPDATE bookings SET status = ?, payment_status = ?, notes = ?, updated_at = ? WHERE id = ?`,
      [status, paymentStatus, notes, now, id]
    );
    
    // If booking cancelled, make plot available again
    if (status === 'cancelled') {
      const [bookingRows] = await pool.query('SELECT plot_id FROM bookings WHERE id = ?', [id]);
      if (bookingRows.length > 0) {
        await pool.query(
          "UPDATE plots SET status = 'Available' WHERE id = ?",
          [bookingRows[0].plot_id]
        );
      }
    }
    
    // If booking confirmed and fully paid, mark plot as sold
    if (status === 'confirmed' && paymentStatus === 'paid') {
      const [bookingRows] = await pool.query('SELECT plot_id FROM bookings WHERE id = ?', [id]);
      if (bookingRows.length > 0) {
        await pool.query(
          "UPDATE plots SET status = 'Sold' WHERE id = ?",
          [bookingRows[0].plot_id]
        );
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Booking update error:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// Delete booking
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get plot id to make it available again
    const [bookingRows] = await pool.query('SELECT plot_id FROM bookings WHERE id = ?', [id]);
    
    // Delete payments first
    await pool.query('DELETE FROM payments WHERE booking_id = ?', [id]);
    
    // Delete booking
    await pool.query('DELETE FROM bookings WHERE id = ?', [id]);
    
    // Make plot available again
    if (bookingRows.length > 0) {
      await pool.query(
        "UPDATE plots SET status = 'Available' WHERE id = ?",
        [bookingRows[0].plot_id]
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Booking delete error:', error);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

// Add payment to booking
router.post('/:id/payments', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, paymentMethod, notes } = req.body;
    
    const paymentId = crypto.randomUUID();
    const now = new Date();
    
    await pool.query(
      `INSERT INTO payments (id, booking_id, amount, payment_date, payment_method, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [paymentId, id, amount, now, paymentMethod, notes, now]
    );
    
    // Update booking paid amount
    await pool.query(
      `UPDATE bookings 
       SET paid_amount = paid_amount + ?, 
           payment_status = CASE WHEN paid_amount + ? >= total_amount THEN 'paid' ELSE 'partial' END,
           updated_at = ?
       WHERE id = ?`,
      [amount, amount, now, id]
    );
    
    res.status(201).json({
      id: paymentId,
      bookingId: id,
      amount,
      paymentDate: now,
      paymentMethod,
      notes
    });
  } catch (error) {
    console.error('Payment create error:', error);
    res.status(500).json({ error: 'Failed to add payment' });
  }
});

export default router;
