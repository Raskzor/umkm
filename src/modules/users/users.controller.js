const express = require('express');
const router = express.Router();
const { authenticate } = require('../../shared/utils/rbac');
const { resolveNavigationMenu } = require('../../config/navigationMenu');

/**
 * @route GET /api/v1/users/navigation-menus
 * @desc Dynamic Menu Resolver Endpoint returning accessible navigation tree & metadata limits based on user role & tier
 * @access Protected (JWT Authenticated)
 */
router.get('/navigation-menus', authenticate, (req, res) => {
  const userRole = req.user.role_code;
  const userTier = req.user.role_code === 'UMKM_OWNER_PREMIUM' ? 'PREMIUM' : 'FREE';

  const menuResolution = resolveNavigationMenu(userRole, userTier);

  return res.json({
    success: true,
    message: `Navigation menu resolved for role '${userRole}'`,
    data: menuResolution
  });
});

module.exports = router;
