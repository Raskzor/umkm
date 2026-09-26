/**
 * Navigation Menu Configuration Contract & Resolver Engine
 * Ekosistem SuperUMKM — Role-Based Access Control (RBAC) & Quota Limits Contract
 */

const NAVIGATION_CATEGORIES = {
  store_operations: {
    id: 'store_operations',
    title: 'Operasional Toko & Kasir',
    icon: '🛒'
  },
  finance: {
    id: 'finance',
    title: 'Keuangan & Laba Rugi',
    icon: '💰'
  },
  marketing: {
    id: 'marketing',
    title: 'Pemasaran & Promosi Digital',
    icon: '📢'
  },
  consulting: {
    id: 'consulting',
    title: 'Pendampingan & Ekosistem',
    icon: '📊'
  },
  education_admin: {
    id: 'education_admin',
    title: 'Edukasi & Administrasi System',
    icon: '🎓'
  }
};

const NAVIGATION_MENU = [
  // 1. Store Operations (POS, QRIS, Inventory, Staff)
  {
    id: 'pos_instant',
    title: 'Mesin Kasir & QRIS Kasir',
    category: 'store_operations',
    tabId: 'pos-tab',
    path: '/dashboard#pos-tab',
    icon: '📱',
    allowedRoles: ['UMKM_OWNER_FREE', 'UMKM_OWNER_PREMIUM', 'CASHIER', 'SUPER_ADMIN'],
    allowedTiers: ['FREE', 'PREMIUM'],
    badgeLabel: 'Kasir & QRIS'
  },
  {
    id: 'inventory_stok_bon',
    title: 'Stok, Bon & Supplier Order',
    category: 'store_operations',
    tabId: 'inventory-tab',
    path: '/dashboard#inventory-tab',
    icon: '📦',
    allowedRoles: ['UMKM_OWNER_FREE', 'UMKM_OWNER_PREMIUM', 'CASHIER', 'SUPER_ADMIN'],
    allowedTiers: ['FREE', 'PREMIUM']
  },
  {
    id: 'staff_management',
    title: 'Manajemen Anak Buah (Kasir)',
    category: 'store_operations',
    tabId: 'staff-tab',
    path: '/dashboard#staff-tab',
    icon: '👥',
    allowedRoles: ['UMKM_OWNER_FREE', 'UMKM_OWNER_PREMIUM', 'SUPER_ADMIN'],
    allowedTiers: ['FREE', 'PREMIUM'],
    badgeLabel: 'Hak Akses Staf'
  },

  // 2. Finance (Cashflow & P&L Saku)
  {
    id: 'cashflow_pnl',
    title: 'Cashflow & P&L Saku',
    category: 'finance',
    tabId: 'cashflow-tab',
    path: '/dashboard#cashflow-tab',
    icon: '💰',
    allowedRoles: ['UMKM_OWNER_FREE', 'UMKM_OWNER_PREMIUM', 'SUPER_ADMIN'],
    allowedTiers: ['FREE', 'PREMIUM'],
    badgeLabel: 'Laba Rugi 1-Klik'
  },

  // 3. Marketing (G-Maps, Web Builder, WA Loyalty, AI Promo)
  {
    id: 'gmaps_review',
    title: 'Google Maps & AI Review',
    category: 'marketing',
    tabId: 'gmaps-tab',
    path: '/dashboard#gmaps-tab',
    icon: '📍',
    allowedRoles: ['UMKM_OWNER_FREE', 'UMKM_OWNER_PREMIUM', 'FIELD_AGENT', 'SUPER_ADMIN'],
    allowedTiers: ['FREE', 'PREMIUM']
  },
  {
    id: 'landing_builder',
    title: 'Builder Website Sementara',
    category: 'marketing',
    tabId: 'landing-tab',
    path: '/dashboard#landing-tab',
    icon: '🌐',
    allowedRoles: ['UMKM_OWNER_FREE', 'UMKM_OWNER_PREMIUM', 'FIELD_AGENT', 'SUPER_ADMIN'],
    allowedTiers: ['FREE', 'PREMIUM']
  },
  {
    id: 'wa_loyalty',
    title: 'Smart WA Broadcast & Loyalty',
    category: 'marketing',
    tabId: 'loyalty-tab',
    path: '/dashboard#loyalty-tab',
    icon: '📢',
    allowedRoles: ['UMKM_OWNER_FREE', 'UMKM_OWNER_PREMIUM', 'SUPER_ADMIN'],
    allowedTiers: ['FREE', 'PREMIUM']
  },
  {
    id: 'ai_copywriting',
    title: 'AI Promo Generator & Poster',
    category: 'marketing',
    tabId: 'copywriting-tab',
    path: '/dashboard#copywriting-tab',
    icon: '✍️',
    allowedRoles: ['UMKM_OWNER_FREE', 'UMKM_OWNER_PREMIUM', 'SUPER_ADMIN'],
    allowedTiers: ['FREE', 'PREMIUM']
  },

  // 4. Consulting & Field Ecosystem (Audit, Kit, Tickets, Marketplace)
  {
    id: 'audit_kit',
    title: 'Health Check & Action Kit',
    category: 'consulting',
    tabId: 'audit-tab',
    path: '/dashboard#audit-tab',
    icon: '📊',
    allowedRoles: ['UMKM_OWNER_FREE', 'UMKM_OWNER_PREMIUM', 'FIELD_AGENT', 'SUPER_ADMIN'],
    allowedTiers: ['FREE', 'PREMIUM'],
    badgeLabel: 'Diagnosis 5 Menit'
  },
  {
    id: 'consultation_services',
    title: 'Jasa Pendampingan & Tiket',
    category: 'consulting',
    tabId: 'services-tab',
    path: '/dashboard#services-tab',
    icon: '🛠️',
    allowedRoles: ['UMKM_OWNER_FREE', 'UMKM_OWNER_PREMIUM', 'FIELD_AGENT', 'SUPER_ADMIN'],
    allowedTiers: ['FREE', 'PREMIUM']
  },
  {
    id: 'field_geotag_dispatch',
    title: 'Smart Route & Geotag Agent',
    category: 'consulting',
    tabId: 'services-tab',
    path: '/dashboard#services-tab',
    icon: '🚴',
    allowedRoles: ['FIELD_AGENT', 'SUPER_ADMIN'],
    allowedTiers: ['FREE', 'PREMIUM'],
    badgeLabel: 'Khusus Agen'
  },
  {
    id: 'marketplace_community',
    title: 'Marketplace Usaha & Komunitas',
    category: 'consulting',
    tabId: 'landing-tab',
    path: '/dashboard#landing-tab',
    icon: '🏪',
    allowedRoles: ['UMKM_OWNER_FREE', 'UMKM_OWNER_PREMIUM', 'FIELD_AGENT', 'SUPER_ADMIN'],
    allowedTiers: ['FREE', 'PREMIUM']
  },

  // 5. Education & Admin (Courses, System Docs)
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
    can_generate_ai_poster: true
  };

  if (role === 'UMKM_OWNER_PREMIUM') {
    metadata = {
      staff_limit: 5, // Default Premium Quota: 5 Staff (Extra staff requires Add-On)
      qris_type: 'DYNAMIC',
      max_landing_pages: -1, // Unlimited
      video_access_tier: 'ALL',
      can_access_cashflow_export: true,
      can_generate_ai_poster: true
    };
  } else if (role === 'SUPER_ADMIN') {
    metadata = {
      staff_limit: -1,
      qris_type: 'DYNAMIC',
      max_landing_pages: -1,
      video_access_tier: 'ALL',
      can_access_cashflow_export: true,
      can_generate_ai_poster: true
    };
  } else if (role === 'CASHIER') {
    metadata = {
      staff_limit: 0,
      qris_type: 'STATIC',
      max_landing_pages: 0,
      video_access_tier: 'BASIC',
      can_access_cashflow_export: false,
      can_generate_ai_poster: false
    };
  } else if (role === 'FIELD_AGENT') {
    metadata = {
      staff_limit: 0,
      qris_type: 'STATIC',
      max_landing_pages: 0,
      video_access_tier: 'ALL',
      can_access_cashflow_export: false,
      can_generate_ai_poster: false
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
