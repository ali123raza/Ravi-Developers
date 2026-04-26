import express from 'express';
import crypto from 'crypto';
import pool from '../lib/db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all SEO settings
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM seo_settings ORDER BY page ASC');
    
    const settings = rows.map(s => ({
      id: s.id,
      page: s.page,
      metaTitle: s.meta_title,
      metaDescription: s.meta_description,
      metaKeywords: s.meta_keywords,
      ogTitle: s.og_title,
      ogDescription: s.og_description,
      ogImage: s.og_image,
      canonicalUrl: s.canonical_url,
      robotsMeta: s.robots_meta,
      updatedAt: s.updated_at
    }));
    
    res.json(settings);
  } catch (error) {
    console.error('SEO settings fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch SEO settings' });
  }
});

// Get SEO settings for a specific page
router.get('/page/:page', async (req, res) => {
  try {
    const { page } = req.params;
    
    const [rows] = await pool.query('SELECT * FROM seo_settings WHERE page = ?', [page]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'SEO settings not found for this page' });
    }
    
    const s = rows[0];
    res.json({
      id: s.id,
      page: s.page,
      metaTitle: s.meta_title,
      metaDescription: s.meta_description,
      metaKeywords: s.meta_keywords,
      ogTitle: s.og_title,
      ogDescription: s.og_description,
      ogImage: s.og_image,
      canonicalUrl: s.canonical_url,
      robotsMeta: s.robots_meta,
      updatedAt: s.updated_at
    });
  } catch (error) {
    console.error('SEO page fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch SEO settings' });
  }
});

// Get single SEO setting by ID
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.query('SELECT * FROM seo_settings WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'SEO setting not found' });
    }
    
    const s = rows[0];
    res.json({
      id: s.id,
      page: s.page,
      metaTitle: s.meta_title,
      metaDescription: s.meta_description,
      metaKeywords: s.meta_keywords,
      ogTitle: s.og_title,
      ogDescription: s.og_description,
      ogImage: s.og_image,
      canonicalUrl: s.canonical_url,
      robotsMeta: s.robots_meta,
      updatedAt: s.updated_at
    });
  } catch (error) {
    console.error('SEO fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch SEO setting' });
  }
});

// Create SEO settings for a page - Admin only
router.post('/', requireAdmin, async (req, res) => {
  try {
    const {
      id,
      page,
      metaTitle,
      metaDescription,
      metaKeywords,
      ogTitle,
      ogDescription,
      ogImage,
      canonicalUrl,
      robotsMeta
    } = req.body;
    
    const seoId = id || crypto.randomUUID();
    
    await pool.query(
      `INSERT INTO seo_settings (id, page, meta_title, meta_description, meta_keywords, og_title, og_description, og_image, canonical_url, robots_meta) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        seoId,
        page,
        metaTitle || null,
        metaDescription || null,
        metaKeywords || null,
        ogTitle || null,
        ogDescription || null,
        ogImage || null,
        canonicalUrl || null,
        robotsMeta || 'index, follow'
      ]
    );
    
    res.status(201).json({
      id: seoId,
      page,
      message: 'SEO settings created successfully'
    });
  } catch (error) {
    console.error('SEO create error:', error);
    res.status(500).json({ error: 'Failed to create SEO settings' });
  }
});

// Update SEO settings - Admin only
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      page,
      metaTitle,
      metaDescription,
      metaKeywords,
      ogTitle,
      ogDescription,
      ogImage,
      canonicalUrl,
      robotsMeta
    } = req.body;
    
    await pool.query(
      `UPDATE seo_settings SET 
        page = ?, meta_title = ?, meta_description = ?, meta_keywords = ?, 
        og_title = ?, og_description = ?, og_image = ?, canonical_url = ?, robots_meta = ? 
       WHERE id = ?`,
      [
        page,
        metaTitle || null,
        metaDescription || null,
        metaKeywords || null,
        ogTitle || null,
        ogDescription || null,
        ogImage || null,
        canonicalUrl || null,
        robotsMeta || 'index, follow',
        id
      ]
    );
    
    res.json({ id, message: 'SEO settings updated successfully' });
  } catch (error) {
    console.error('SEO update error:', error);
    res.status(500).json({ error: 'Failed to update SEO settings' });
  }
});

// Delete SEO settings - Admin only
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM seo_settings WHERE id = ?', [id]);
    
    res.json({ success: true, message: 'SEO settings deleted successfully' });
  } catch (error) {
    console.error('SEO delete error:', error);
    res.status(500).json({ error: 'Failed to delete SEO settings' });
  }
});

export default router;
