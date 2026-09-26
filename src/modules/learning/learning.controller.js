const express = require('express');
const router = express.Router();
const db = require('../../shared/database/db');
const { authenticate, authorizeRoles } = require('../../shared/utils/rbac');

function convertToEmbedUrl(url) {
  if (!url) return 'https://www.youtube.com/embed/dQw4w9WgXcQ';
  let cleanUrl = url.trim();

  // YouTube Links
  if (cleanUrl.includes('youtube.com/watch?v=')) {
    const videoId = cleanUrl.split('v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  } else if (cleanUrl.includes('youtu.be/')) {
    const videoId = cleanUrl.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  } else if (cleanUrl.includes('youtube.com/embed/')) {
    return cleanUrl;
  }

  // Google Drive Links
  if (cleanUrl.includes('drive.google.com')) {
    if (cleanUrl.includes('/view')) {
      return cleanUrl.replace('/view', '/preview');
    } else if (!cleanUrl.includes('/preview')) {
      const match = cleanUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }
    return cleanUrl;
  }

  return cleanUrl;
}

// Get Courses / Video Micro-Tutorials
router.get('/courses', authenticate, (req, res) => {
  const isPremium = ['UMKM_OWNER_PREMIUM', 'FIELD_AGENT', 'SUPER_ADMIN'].includes(req.user.role_code);

  const courses = db.tutorialContents.map(tut => {
    const isLocked = tut.minimum_tier === 'PREMIUM' && !isPremium;
    return {
      ...tut,
      embed_url: convertToEmbedUrl(tut.video_url),
      is_locked: isLocked,
      lock_reason: isLocked ? 'Fitur ini khusus untuk member UMKM Premium' : null
    };
  });

  return res.json({
    success: true,
    user_tier: req.user.role_code,
    data: courses
  });
});

// Admin Upload / Manage Tutorial (SUPER_ADMIN only)
router.post('/courses', authenticate, authorizeRoles('SUPER_ADMIN'), (req, res) => {
  const { title, description, module_category, video_url, duration_seconds, minimum_tier, steps } = req.body;

  if (!title || !video_url) {
    return res.status(400).json({ success: false, error: 'Judul dan URL Video wajib diisi' });
  }

  const embed_url = convertToEmbedUrl(video_url);

  let formattedSteps = [];
  if (Array.isArray(steps)) {
    formattedSteps = steps.filter(s => typeof s === 'string' ? s.trim().length > 0 : (s && s.instruction));
  } else if (typeof steps === 'string') {
    formattedSteps = steps.split('\n').map(s => s.trim()).filter(Boolean);
  }

  if (formattedSteps.length === 0) {
    formattedSteps = [
      'Langkah 1: Tonton video panduan sampai selesai.',
      'Langkah 2: Buka menu modul terkait pada sistem SuperUMKM.',
      'Langkah 3: Praktikkan panduan pada bisnis UMKM Anda.'
    ];
  }

  const newTutorial = {
    id: `tut-${Date.now()}`,
    title,
    description: description || 'Tutorial strategi & tips praktis ekosistem SuperUMKM.',
    module_category: module_category || 'Strategi Usaha',
    video_url,
    embed_url,
    duration_seconds: parseInt(duration_seconds) || 300,
    minimum_tier: minimum_tier || 'FREE',
    steps: formattedSteps,
    is_active: true,
    created_at: new Date().toISOString()
  };

  db.tutorialContents.unshift(newTutorial);

  return res.status(201).json({
    success: true,
    data: newTutorial
  });
});

// Admin Delete Tutorial (SUPER_ADMIN only)
router.delete('/courses/:id', authenticate, authorizeRoles('SUPER_ADMIN'), (req, res) => {
  const { id } = req.params;
  const index = db.tutorialContents.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Konten video tidak ditemukan' });
  }

  db.tutorialContents.splice(index, 1);
  return res.json({ success: true, message: 'Video tutorial berhasil dihapus' });
});

module.exports = router;
