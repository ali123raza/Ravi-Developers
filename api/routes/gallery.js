/* eslint-env node */
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { requireAdmin } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const uploadsDir = path.join(__dirname, '..', '..', 'public', 'uploads');
const galleryDbPath = path.join(__dirname, '..', 'lib', 'gallery.json');

// Ensure directories exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Load gallery metadata
function loadGallery() {
  try {
    if (fs.existsSync(galleryDbPath)) {
      const data = fs.readFileSync(galleryDbPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading gallery:', error);
  }
  return [];
}

// Save gallery metadata
function saveGallery(gallery) {
  try {
    fs.writeFileSync(galleryDbPath, JSON.stringify(gallery, null, 2));
  } catch (error) {
    console.error('Error saving gallery:', error);
  }
}

// Scan uploads directory and sync with gallery metadata
function scanUploads() {
  const gallery = loadGallery();
  const files = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : [];
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  
  // Add new files
  files.forEach(filename => {
    const ext = path.extname(filename).toLowerCase();
    if (imageExtensions.includes(ext)) {
      const exists = gallery.find(item => item.filename === filename);
      if (!exists) {
        const filePath = path.join(uploadsDir, filename);
        const stats = fs.statSync(filePath);
        gallery.push({
          id: crypto.randomUUID(),
          filename,
          url: `/uploads/${filename}`,
          category: 'gallery',
          size: stats.size,
          createdAt: stats.ctime.toISOString()
        });
      }
    }
  });
  
  // Remove entries for deleted files
  const validGallery = gallery.filter(item => {
    const filePath = path.join(uploadsDir, item.filename);
    return fs.existsSync(filePath);
  });
  
  saveGallery(validGallery);
  return validGallery;
}

// Get all gallery images
router.get('/', requireAdmin, async (req, res) => {
  try {
    const gallery = scanUploads();
    gallery.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(gallery);
  } catch (error) {
    console.error('Gallery fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch gallery' });
  }
});

// Delete gallery image
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const gallery = loadGallery();
    const imageIndex = gallery.findIndex(item => item.id === id);
    
    if (imageIndex === -1) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    const image = gallery[imageIndex];
    const filePath = path.join(uploadsDir, image.filename);
    
    // Delete file if exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Remove from gallery
    gallery.splice(imageIndex, 1);
    saveGallery(gallery);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Gallery delete error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

export default router;
