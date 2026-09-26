/**
 * Local SEO & Google Maps Helper Utility Module for SuperUMKM Platform
 * Provides NAP Consistency Detection, Local Keyword Injector, Category Optimizer, and Post Scheduler.
 */

// 1. Local Keyword Injector Helper
function generateLocalKeywords({ business_name, core_product, location_street_or_district }) {
  const name = (business_name || 'Toko UMKM').trim();
  const product = (core_product || 'Produk & Jasa').trim();
  const location = (location_street_or_district || 'Sekitar Anda').trim();

  const suggested_title = `${name} - ${product} ${location}`;
  const suggested_description = `${name} menyediakan ${product} berkualitas dan harga terjangkau di ${location}. Siap melayani pelanggan lokal dengan pengiriman cepat dan pemesanan instan via WhatsApp.`;
  
  const keywords = [
    `${product} ${location}`,
    `${name} ${location}`,
    `Toko ${product} Terdekat ${location}`,
    `Beli ${product} Murah ${location}`,
    `Jual ${product} ${location}`
  ];

  return {
    suggested_title,
    suggested_description,
    keywords
  };
}

// 2. Standard Google My Business Category Mapping
const GMB_CATEGORY_MAPPING = {
  'Retail & Sembako': {
    primary: 'Grocery Store',
    secondary_options: ['Convenience Store', 'Supermarket', 'Discount Store', 'Food Store']
  },
  'Kuliner / F&B': {
    primary: 'Restaurant',
    secondary_options: ['Cafe', 'Food Delivery Service', 'Caterer', 'Indonesian Restaurant']
  },
  'Jasa & Servis': {
    primary: 'Service Establishment',
    secondary_options: ['Repair Shop', 'Home Goods Store', 'Laundry Service', 'Tailor']
  },
  'Fashion & Pakaian': {
    primary: 'Clothing Store',
    secondary_options: ['Boutique', 'Fashion Accessories Store', 'Shoe Store', 'Tailor Shop']
  },
  'Otomotif & Bengkel': {
    primary: 'Auto Repair Shop',
    secondary_options: ['Car Wash', 'Auto Parts Store', 'Motorcycle Repair Shop', 'Tire Shop']
  },
  'Kesehatan & Kecantikan': {
    primary: 'Beauty Salon',
    secondary_options: ['Barbershop', 'Pharmacy', 'Spa', 'Cosmetics Store']
  }
};

function getGMBMappingForCategory(userCategory) {
  return GMB_CATEGORY_MAPPING[userCategory] || {
    primary: 'Store',
    secondary_options: ['General Store', 'Merchant', 'Local Business']
  };
}

// 3. NAP (Name, Address, Phone) Consistency Detector
function calculateNAPConsistency({ localPhone = '', localAddress = '', gmapsPhone = '', gmapsAddress = '' }) {
  // Normalize phone numbers (strip non-digits, replace +62 or 0 with standard 62)
  const normLocalPhone = localPhone.replace(/\D/g, '').replace(/^0/, '62');
  const normGmapsPhone = gmapsPhone.replace(/\D/g, '').replace(/^0/, '62');

  const phoneMatched = normLocalPhone && normGmapsPhone ? normLocalPhone === normGmapsPhone : true;
  const phoneMismatchPenalty = phoneMatched ? 0 : 50;

  // Compare address similarity
  const cleanLocalAddr = localAddress.toLowerCase().replace(/[^\w\s]/gi, '').trim();
  const cleanGmapsAddr = gmapsAddress.toLowerCase().replace(/[^\w\s]/gi, '').trim();

  let addressSimilarity = 100;
  if (cleanLocalAddr && cleanGmapsAddr) {
    const localTokens = new Set(cleanLocalAddr.split(/\s+/));
    const gmapsTokens = new Set(cleanGmapsAddr.split(/\s+/));
    let intersection = 0;
    localTokens.forEach(token => {
      if (gmapsTokens.has(token)) intersection++;
    });
    const union = new Set([...localTokens, ...gmapsTokens]).size;
    addressSimilarity = Math.round((intersection / Math.max(1, union)) * 100);
  }

  const addressMismatchPenalty = addressSimilarity < 70 ? (100 - addressSimilarity) / 2 : 0;
  const totalMismatchPercentage = Math.min(100, Math.round(phoneMismatchPenalty + addressMismatchPenalty));

  const isConsistent = totalMismatchPercentage <= 20;

  let mismatchReason = null;
  if (!phoneMatched) {
    mismatchReason = `Nomor telepon toko di database (${localPhone}) tidak cocok dengan profil Google Maps (${gmapsPhone}).`;
  } else if (addressSimilarity < 70) {
    mismatchReason = `Alamat fisik toko di database (${localAddress}) berbeda signifikan dengan lokasi Google Maps (${gmapsAddress}).`;
  }

  return {
    is_consistent: isConsistent,
    mismatch_percentage: totalMismatchPercentage,
    phone_matched: phoneMatched,
    address_similarity_percent: addressSimilarity,
    mismatch_reason: mismatchReason
  };
}

// 4. Google Posts Routine Scheduler Helper
function calculatePostScheduleStatus(lastPostAt) {
  if (!lastPostAt) {
    return {
      post_reminder_due: true,
      days_since_last_post: 8,
      status_label: 'PERLU UPDATE KONTEN',
      reminder_message: 'Halo! Toko Anda belum mengunggah foto / postingan baru di Google Maps. Yuk upload foto produk baru hari ini untuk menarik pembeli sekitar!'
    };
  }

  const lastDate = new Date(lastPostAt);
  const diffTime = Math.abs(Date.now() - lastDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const isDue = diffDays >= 7;

  return {
    post_reminder_due: isDue,
    days_since_last_post: diffDays,
    last_post_at: lastPostAt,
    status_label: isDue ? 'PERLU UPDATE KONTEN' : 'AKTIF & SEGAR',
    reminder_message: isDue
      ? `Sudah ${diffDays} hari sejak postingan Google Maps terakhir Anda. Unggah foto produk/promo baru agar toko makin ramai!`
      : `Postingan Google Maps Anda masih segar (diperbarui ${diffDays} hari yang lalu).`
  };
}

module.exports = {
  generateLocalKeywords,
  GMB_CATEGORY_MAPPING,
  getGMBMappingForCategory,
  calculateNAPConsistency,
  calculatePostScheduleStatus
};
