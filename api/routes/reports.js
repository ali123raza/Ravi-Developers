/* eslint-env node */
import express from 'express';
import pool from '../lib/db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get sales report
router.get('/sales', requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = '';
    const params = [];
    
    if (startDate && endDate) {
      dateFilter = 'WHERE b.created_at BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    // Monthly sales summary
    const [monthlyRows] = await pool.query(`
      SELECT 
        DATE_FORMAT(b.created_at, '%Y-%m') as month,
        COUNT(*) as totalBookings,
        SUM(b.total_amount) as totalAmount,
        SUM(b.paid_amount) as totalPaid,
        COUNT(DISTINCT b.customer_id) as uniqueCustomers
      FROM bookings b
      ${dateFilter}
      GROUP BY DATE_FORMAT(b.created_at, '%Y-%m')
      ORDER BY month DESC
    `, params);
    
    // Project performance
    const [projectRows] = await pool.query(`
      SELECT 
        pr.name as projectName,
        COUNT(b.id) as totalBookings,
        SUM(b.total_amount) as totalRevenue
      FROM bookings b
      JOIN plots p ON b.plot_id = p.id
      JOIN projects pr ON p.project_id = pr.id
      ${dateFilter}
      GROUP BY pr.id, pr.name
      ORDER BY totalRevenue DESC
    `, params);
    
    // Payment status breakdown
    const [statusRows] = await pool.query(`
      SELECT 
        payment_status,
        COUNT(*) as count,
        SUM(total_amount) as totalAmount,
        SUM(paid_amount) as totalPaid
      FROM bookings
      ${dateFilter}
      GROUP BY payment_status
    `, params);
    
    res.json({
      monthly: monthlyRows.map(r => ({
        month: r.month,
        totalBookings: r.totalBookings,
        totalAmount: r.totalAmount,
        totalPaid: r.totalPaid,
        uniqueCustomers: r.uniqueCustomers
      })),
      byProject: projectRows.map(r => ({
        projectName: r.projectName,
        totalBookings: r.totalBookings,
        totalRevenue: r.totalRevenue
      })),
      byStatus: statusRows.map(r => ({
        status: r.payment_status,
        count: r.count,
        totalAmount: r.totalAmount,
        totalPaid: r.totalPaid
      }))
    });
  } catch (error) {
    console.error('Sales report error:', error);
    res.status(500).json({ error: 'Failed to generate sales report' });
  }
});

// Get inquiry conversion report
router.get('/inquiries', requireAdmin, async (req, res) => {
  try {
    // Total inquiries by status
    const [statusRows] = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM inquiries
      GROUP BY status
    `);
    
    // Monthly inquiry trends
    const [monthlyRows] = await pool.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as totalInquiries,
        COUNT(CASE WHEN customer_id IS NOT NULL THEN 1 END) as convertedInquiries
      FROM inquiries
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `);
    
    // Conversion rate
    const [totalRows] = await pool.query('SELECT COUNT(*) as total FROM inquiries');
    const [convertedRows] = await pool.query('SELECT COUNT(*) as count FROM inquiries WHERE customer_id IS NOT NULL');
    
    const total = totalRows[0].total;
    const converted = convertedRows[0].count;
    const conversionRate = total > 0 ? (converted / total * 100).toFixed(2) : 0;
    
    res.json({
      byStatus: statusRows.map(r => ({
        status: r.status,
        count: r.count
      })),
      monthly: monthlyRows.map(r => ({
        month: r.month,
        totalInquiries: r.totalInquiries,
        convertedInquiries: r.convertedInquiries,
        conversionRate: r.totalInquiries > 0 ? (r.convertedInquiries / r.totalInquiries * 100).toFixed(2) : 0
      })),
      summary: {
        totalInquiries: total,
        convertedToCustomers: converted,
        conversionRate: parseFloat(conversionRate)
      }
    });
  } catch (error) {
    console.error('Inquiry report error:', error);
    res.status(500).json({ error: 'Failed to generate inquiry report' });
  }
});

// Get plot availability report
router.get('/plots', requireAdmin, async (req, res) => {
  try {
    // By status
    const [statusRows] = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM plots
      GROUP BY status
    `);
    
    // By project
    const [projectRows] = await pool.query(`
      SELECT 
        pr.name as projectName,
        COUNT(*) as totalPlots,
        SUM(CASE WHEN p.status = 'Available' THEN 1 ELSE 0 END) as availablePlots,
        SUM(CASE WHEN p.status = 'Booked' OR p.status = 'Reserved' THEN 1 ELSE 0 END) as bookedPlots,
        SUM(CASE WHEN p.status = 'Sold' THEN 1 ELSE 0 END) as soldPlots
      FROM plots p
      JOIN projects pr ON p.project_id = pr.id
      GROUP BY pr.id, pr.name
    `);
    
    // By type
    const [typeRows] = await pool.query(`
      SELECT type, COUNT(*) as count
      FROM plots
      GROUP BY type
    `);
    
    res.json({
      byStatus: statusRows.map(r => ({
        status: r.status,
        count: r.count
      })),
      byProject: projectRows.map(r => ({
        projectName: r.projectName,
        totalPlots: r.totalPlots,
        available: r.availablePlots,
        booked: r.bookedPlots,
        sold: r.soldPlots
      })),
      byType: typeRows.map(r => ({
        type: r.type,
        count: r.count
      }))
    });
  } catch (error) {
    console.error('Plots report error:', error);
    res.status(500).json({ error: 'Failed to generate plots report' });
  }
});

// Get dashboard summary
router.get('/summary', requireAdmin, async (req, res) => {
  try {
    // Current month stats
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // This month bookings
    const [bookingRows] = await pool.query(`
      SELECT COUNT(*) as count, SUM(total_amount) as revenue
      FROM bookings
      WHERE created_at >= ?
    `, [firstDayOfMonth]);
    
    // This month inquiries
    const [inquiryRows] = await pool.query(`
      SELECT COUNT(*) as count
      FROM inquiries
      WHERE created_at >= ?
    `, [firstDayOfMonth]);
    
    // Total customers
    const [customerRows] = await pool.query('SELECT COUNT(*) as count FROM customers');
    
    // Available plots
    const [plotRows] = await pool.query("SELECT COUNT(*) as count FROM plots WHERE status = 'Available'");
    
    // Recent payments
    const [paymentRows] = await pool.query(`
      SELECT SUM(amount) as total
      FROM payments
      WHERE payment_date >= ?
    `, [firstDayOfMonth]);
    
    res.json({
      thisMonth: {
        bookings: bookingRows[0].count,
        revenue: bookingRows[0].revenue || 0,
        inquiries: inquiryRows[0].count,
        payments: paymentRows[0].total || 0
      },
      totals: {
        customers: customerRows[0].count,
        availablePlots: plotRows[0].count
      }
    });
  } catch (error) {
    console.error('Summary report error:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

export default router;
