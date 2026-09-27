/**
 * Navigation Menu Configuration Contract & Resolver Engine
 * Ekosistem SuperUMKM — Role-Based Access Control (RBAC) & Quota Limits Contract
 */

const NAVIGATION_CATEGORIES = {
  core_hook_1: {
    id: 'core_hook_1',
    title: '1. Audit & Optimasi Google Maps (Pintu Masuk)',
    icon: '🎯'
  },
  core_hook_2: {
    id: 'core_hook_2',
    title: '2. Kasir POS & QRIS Instan (Transaksi)',
    icon: '🛒'
  },
  core_hook_3: {
    id: 'core_hook_3',
    title: '3. Keuangan & Laba Rugi Saku (Retensi)',
    icon: '💰'
  },
  deferred_v2: {
    id: 'deferred_v2',
    title: 'Modul Lanjutan (Ditunda v2.0)',
    icon: '⏳'
  },
  education_admin: {
    id: 'education_admin',
    title: 'Edukasi & Admin System',
    icon: '🎓'
  }
};

const NAVIGATION_MENU = [
  // Core Hook 1: Lead Magnet, Google Maps & Website Toko Instan (V1)
  {
    id: 'audit_kit',
    title: 'Health Check & Action Kit',
    category: 'core_hook_1',
    tabId: 'audit-tab',
    path: '/dashboard#audit-tab',
    icon: '📊',
    allowedRoles: ['UMKM_OWNER_FREE', 'UMKM_OWNER_PREMIUM', 'FIELD_AGENT', 'SUPER_ADMIN'],
    allowedTiers: ['FREE', 'PREMIUM'],
    badgeLabel: 'Diagnosis 5 Menit',
    isCoreHook: true
  },
  {
    id: 'gmaps_review',
    title: 'Google Maps & Standee QR Review',
    category: 'core_hook_1',
    tabId: 'gmaps-tab',
    path: '/dashboard#gmaps-tab',
    icon: '📍',
    allowedRoles: ['UMKM_OWNER_FREE', 'UMKM_OWNER_PREMIUM', 'FIELD_AGENT', 'SUPER_ADMIN'],
    allowedTiers: ['FREE', 'PREMIUM'],
    badgeLabel: 'Google Maps',
    isCoreHook: true
  },
  {
    id: 'landing_builder',
    title: 'Website Toko Instan (/toko/:slug)',
    category: 'core_hook_1',
    tabId: 'landing-tab',
    path: '/dashboard#landing-tab',
    icon: '🌐',
    allowedRoles: ['UMKM_OWNER_FREE', 'UMKM_OWNER_PREMIUM', 'FIELD_AGENT', 'SUPER_ADMIN'],
    allowedTiers: ['FREE', 'PREMIUM'],
    badgeLabel: 'Web Toko (V1)',
    isCoreHook: true
  },

  // Core Hook 2: POS Instant, QRIS Dynamic & Staff Assignment (V1)
  {
    id: 'pos_instant',
    title: 'Mesin Kasir & QRIS Kasir',
    category: 'core_hook_2',
    tabId: 'pos-tab',
    path: '/dashboard#pos-tab',
    icon: '📱',
    allowedRoles: ['UMKM_OWNER_FREE', 'UMKM_OWNER_PREMIUM', 'CASHIER', 'SUPER_ADMIN'],
    allowedTiers: ['FREE', 'PREMIUM'],
    badgeLabel: 'Kasir & QRIS',
    isCoreHook: true
  },
  {
    id: 'staff_management',
    title: 'Manajemen Staf Kasir Toko',
    category: 'core_hook_2',
    tabId: 'staff-tab',
    path: '/dashboard#staff-tab',
    icon: '👥',
    allowedRoles: ['UMKM_OWNER_FREE', 'UMKM_OWNER_PREMIUM', 'SUPER_ADMIN'],
    allowedTiers: ['FREE', 'PREMIUM'],
    badgeLabel: 'Hak Akses Staf',
    isCoreHook: true
  },

  // Core Hook 3: Cashflow, P&L Saku, Jasa Pendampingan & Rute Agen (V1)
  {
    id: 'cashflow_pnl',
    title: 'Cashflow & P&L Saku',
    category: 'core_hook_3',
    tabId: 'cashflow-tab',
    path: '/dashboard#cashflow-tab',
    icon: '💰',
    allowedRoles: ['UMKM_OWNER_FREE', 'UMKM_OWNER_PREMIUM', 'SUPER_ADMIN'],
    allowedTiers: ['FREE', 'PREMIUM'],
    badgeLabel: 'Laba Rugi 1-Klik',
    isCoreHook: true
  },
  {
    id: 'consultation_services',
    title: 'Jasa Pendampingan Lapangan',
    category: 'core_hook_3',
    tabId: 'services-tab',
    path: '/dashboard#services-tab',
    icon: '🛠️',
    allowedRoles: ['UMKM_OWNER_FREE', 'UMKM_OWNER_PREMIUM', 'FIELD_AGENT', 'SUPER_ADMIN'],
    allowedTiers: ['FREE', 'PREMIUM'],
    badgeLabel: 'Jasa Field (V1)',
    isCoreHook: true
  },
  {
    id: 'field_geotag_dispatch',
    title: 'Pusat Rute Agen Lapangan',
    category: 'core_hook_3',
    tabId: 'services-tab',
    path: '/dashboard#services-tab',
    icon: '🚴',
    allowedRoles: ['FIELD_AGENT', 'SUPER_ADMIN'],
    allowedTiers: ['FREE', 'PREMIUM'],
    badgeLabel: 'Rute Agen (V1)',
    isCoreHook: true
  },

  // Deferred Modules V2 (TUNDA UNTUK V2 - SUPER ADMIN ONLY)
  {
    id: 'wa_loyalty',
    title: 'Smart WA Broadcast & Loyalty',
    category: 'deferred_v2',
    tabId: 'loyalty-tab',
    path: '/dashboard#loyalty-tab',
    icon: '📢',
    allowedRoles: ['SUPER_ADMIN'],
    allowedTiers: ['FREE', 'PREMIUM'],
    badgeLabel: 'Ditunda v2.0',
    is_deferred: true
  },
  {
    id: 'ai_copywriting',
    title: 'AI Promo & Poster Generator',
    category: 'deferred_v2',
    tabId: 'copywriting-tab',
    path: '/dashboard#copywriting-tab',
    icon: '✍️',
    allowedRoles: ['SUPER_ADMIN'],
    allowedTiers: ['FREE', 'PREMIUM'],
    badgeLabel: 'Ditunda v2.0',
    is_deferred: true
  },
  {
    id: 'inventory_stok_bon',
    title: 'Stok, Bon & Supplier Engine',
    category: 'deferred_v2',
    tabId: 'inventory-tab',
    path: '/dashboard#inventory-tab',
    icon: '📦',
    allowedRoles: ['SUPER_ADMIN'],
    allowedTiers: ['FREE', 'PREMIUM'],
    badgeLabel: 'Ditunda v2.0',
    is_deferred: true
  },
  {
    id: 'marketplace_community',
    title: 'Marketplace Usaha & Komunitas',
    category: 'deferred_v2',
    tabId: 'landing-tab',
    path: '/dashboard#landing-tab',
    icon: '🏪',
    allowedRoles: ['SUPER_ADMIN'],
    allowedTiers: ['FREE', 'PREMIUM'],
    badgeLabel: 'Ditunda v2.0',
    is_deferred: true
  },

  // Education & Admin (Support Modules)
  {
    id: 'micro_course',
    title: 'Video Micro-Course Edukasi',
    category: 'education_admin',
    tabId: 'learning-tab',
    path: '/dashboard#learning-tab',
    icon: '🎓',
    allowedRoles: ['UMKM_OWNER_FREE', 'UMKM_OWNER_PREMIUM', 'CASHIER', 'FIELD_AGENT', 'SUPER_ADMIN'],
    allowedTiers: ['FREE', 'PREMIUM']
  },
  {
    id: 'system_docs_admin',
    title: 'Dokumentasi Sistem IT (Admin)',
    category: 'education_admin',
    tabId: 'docs-tab',
    path: '/dashboard#docs-tab',
    icon: '📖',
    allowedRoles: ['SUPER_ADMIN'],
    allowedTiers: ['FREE', 'PREMIUM'],
    badgeLabel: 'System Admin Only'
  }
];

/**
 * Resolves the navigation menu structure and quota metadata based on user role & tier
 * @param {string} userRole - Role code (e.g. UMKM_OWNER_FREE, CASHIER, SUPER_ADMIN)
 * @param {string} [userTier] - Optional subscription tier (FREE, PREMIUM)
 */
function resolveNavigationMenu(userRole, userTier) {
  const role = userRole || 'UMKM_OWNER_FREE';
  const tier = userTier || (role === 'UMKM_OWNER_PREMIUM' ? 'PREMIUM' : 'FREE');

  // Quota & Feature Limit Metadata based on RBAC & Subscription Plan
  let metadata = {
    staff_limit: 1,
    qris_type: 'STATIC',
    max_landing_pages: 1,
    video_access_tier: 'BASIC',
    can_access_cashflow_export: true,
    can_generate_ai_poster: false, // Deferred in MVP
    supplier_engine_active: false // Deferred in MVP
  };

  if (role === 'UMKM_OWNER_PREMIUM') {
    metadata = {
      staff_limit: 5,
      qris_type: 'DYNAMIC',
      max_landing_pages: -1,
      video_access_tier: 'ALL',
      can_access_cashflow_export: true,
      can_generate_ai_poster: false,
      supplier_engine_active: false
    };
  } else if (role === 'SUPER_ADMIN') {
    metadata = {
      staff_limit: -1,
      qris_type: 'DYNAMIC',
      max_landing_pages: -1,
      video_access_tier: 'ALL',
      can_access_cashflow_export: true,
      can_generate_ai_poster: true,
      supplier_engine_active: true
    };
  } else if (role === 'CASHIER') {
    metadata = {
      staff_limit: 0,
      qris_type: 'STATIC',
      max_landing_pages: 0,
      video_access_tier: 'BASIC',
      can_access_cashflow_export: false,
      can_generate_ai_poster: false,
      supplier_engine_active: false
    };
  } else if (role === 'FIELD_AGENT') {
    metadata = {
      staff_limit: 0,
      qris_type: 'STATIC',
      max_landing_pages: 0,
      video_access_tier: 'ALL',
      can_access_cashflow_export: false,
      can_generate_ai_poster: false,
      supplier_engine_active: false
    };
  }

  // Filter Permitted Menus based on Role
  const permittedMenus = NAVIGATION_MENU.filter(item => {
    if (role === 'SUPER_ADMIN') return true;
    return item.allowedRoles.includes(role);
  });

  // Group Permitted Items by Category
  const groupedMenus = {};
  Object.keys(NAVIGATION_CATEGORIES).forEach(catKey => {
    const categoryItems = permittedMenus.filter(item => item.category === catKey);
    if (categoryItems.length > 0) {
      groupedMenus[catKey] = {
        ...NAVIGATION_CATEGORIES[catKey],
        items: categoryItems
      };
    }
  });

  return {
    role_code: role,
    tier,
    categories: NAVIGATION_CATEGORIES,
    grouped_menus: groupedMenus,
    flat_menus: permittedMenus,
    metadata
  };
}

module.exports = {
  NAVIGATION_CATEGORIES,
  NAVIGATION_MENU,
  resolveNavigationMenu
};
