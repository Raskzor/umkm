const express = require('express');
const router = express.Router();
const db = require('../../shared/database/db');
const { authenticate, authorizeRoles } = require('../../shared/utils/rbac');

// Get Courses / Video Micro-Tutorials
router.get('/courses', authenticate, (req, res) => {
  const isPremium = ['UMKM_OWNER_PREMIUM', 'FIELD_AGENT', 'SUPER_ADMIN'].includes(req.user.role_code);

  const courses = db.tutorialContents.map(tut => {
    const isLocked = tut.minimum_tier === 'PREMIUM' && !isPremium;
    return {
      ...tut,
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
  const { title, module_category, video_url, duration_seconds, minimum_tier } = req.body;

  if (!title || !video_url) {
    return res.status(400).json({ success: false, error: 'Judul dan URL Video wajib diisi' });
  }

  const newTutorial = {
    id: `tut-${Date.now()}`,
    title,
    module_category: module_category || 'Umum',
    video_url,
    duration_seconds: duration_seconds || 300,
    minimum_tier: minimum_tier || 'FREE',
    is_active: true
  };

  db.tutorialContents.push(newTutorial);

  return res.status(201).json({
    success: true,
    data: newTutorial
  });
});

module.exports = router;
