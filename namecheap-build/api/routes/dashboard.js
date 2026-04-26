/* eslint-env node */
import express from 'express';
import pool from '../lib/db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard stats - Admin only
router.get('/', requireAdmin, async (req, res) => {
  try {
    // Get counts
    const [[{ count: totalProjects }]] = await pool.query('SELECT COUNT(*) as count FROM projects');
    const [[{ count: totalPlots }]] = await pool.query('SELECT COUNT(*) as count FROM plots');
    const [[{ count: availablePlots }]] = await pool.query('SELECT COUNT(*) as count FROM plots WHERE status = ?', ['Available']);
    const [[{ count: newInquiries }]] = await pool.query('SELECT COUNT(*) as count FROM inquiries WHERE status = ?', ['New']);
    
    // Get plots grouped by status
    const [plotsByStatusRows] = await pool.query(
      'SELECT status, COUNT(*) as count FROM plots GROUP BY status'
    );
    
    // Calculate total value of available plots
    const [[{ total: totalValue }]] = await pool.query(
      'SELECT SUM(price) as total FROM plots WHERE status = ?',
      ['Available']
    );
    
    res.json({
      totalProjects,
      totalPlots,
      availablePlots,
      newInquiries,
      totalValue: totalValue || 0,
      plotsByStatus: plotsByStatusRows.map(p => ({
        status: p.status,
        count: p.count
      }))
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    if (process.env.NODE_ENV !== 'production') {
      return res.json({
        totalProjects: 0,
        totalPlots: 0,
        availablePlots: 0,
        newInquiries: 0,
        totalValue: 0,
        plotsByStatus: []
      });
    }
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

export default router;
