// Database Persistence Layer (PostgreSQL Schema Compatible In-Memory DB)
const crypto = require('crypto');

class Database {
  constructor() {
    this.users = [];
    this.businessProfiles = [];
    this.auditLogs = [];
    this.serviceRequests = [];
    this.serviceTasks = [];
    this.tutorialContents = [];
    this.coupons = [];
    this.reviewReplies = [];
    this.waNotifications = [];
    this.posStaff = [];
    this.posTransactions = [];
    this.userKits = {};

    // 5 New Ecosystem Modules Persistence Tables
    this.cashflowRecords = [];
    this.customerContacts = [];
    this.inventoryItems = [];
    this.stockAlerts = [];
    this.debtBooks = [];
    this.qrisTransactions = [];

    this.seed();
  }

  seed() {
    // Seed Users (RBAC Roles: Owner Free, Owner Premium, Cashier, Field Agent, Admin)
    const userFreeId = 'u-free-001';
    const userPremId = 'u-prem-002';
    const agentId = 'u-agent-003';
    const adminId = 'u-admin-004';
    const cashierId = 'u-cashier-005';

    this.users = [
      {
        id: userFreeId,
        phone_number: '081234567890',
        full_name: 'Budi Santoso (Warung Kelontong)',
        role_code: 'UMKM_OWNER_FREE',
        status: 'ACTIVE',
        created_at: new Date().toISOString()
      },
      {
        id: userPremId,
        phone_number: '089876543210',
        full_name: 'Siti Rahma (Kopi Senja Premium)',
        role_code: 'UMKM_OWNER_PREMIUM',
        status: 'ACTIVE',
        created_at: new Date().toISOString()
      },
      {
        id: cashierId,
        phone_number: '081122334455',
        full_name: 'Dewi (Kasir Warung Berkah)',
        role_code: 'CASHIER',
        owner_id: userFreeId,
        pin: '1234',
        status: 'ACTIVE',
        created_at: new Date().toISOString()
      },
      {
        id: agentId,
        phone_number: '085551234567',
        full_name: 'Rian Hidayat (Konsultan Wilayah Jakarta)',
        role_code: 'FIELD_AGENT',
        status: 'ACTIVE',
        created_at: new Date().toISOString()
      },
      {
        id: adminId,
        phone_number: '080011223344',
        full_name: 'Super Admin System',
        role_code: 'SUPER_ADMIN',
        status: 'ACTIVE',
        created_at: new Date().toISOString()
      }
    ];

    // Seed Staff Assignment (Free Plan Max 1 Limit test)
    this.posStaff = [
      {
        id: 'staff-001',
        owner_id: userFreeId,
        user_id: cashierId,
        staff_name: 'Dewi (Kasir Utama)',
        phone_number: '081122334455',
        address: 'Jl. Diponegoro No. 1, Surabaya',
        role_title: 'Kasir Shift Pagi',
        pin: '1234',
        allowed_permissions: ['pos_instant', 'qris_payment', 'inventory_stok_bon'],
        status: 'ACTIVE',
        created_at: new Date().toISOString()
      }
    ];

    // Seed Sample Transactions
    this.posTransactions = [
      {
        id: 'tx-1001',
        owner_id: userFreeId,
        cashier_id: cashierId,
        cashier_name: 'karis (Dewi)',
        customer_name: 'Sheila',
        customer_address: 'Jl. Diponegoro 1, Sby',
        queue_no: 'No.0-3',
        business_name: 'Karis Jaya Shop',
        business_address: 'Jl. Dr. Ir. H. Soekarno No.19, Medokan Semampir Surabaya',
        business_phone: '0812345678',
        items: [
          { name: 'Indomie Goreng', price: 36000, qty: 1, unit: 'lusin', subtotal: 36000 },
          { name: 'Fruit Tea Apple', price: 7000, qty: 1, unit: '500 ml', subtotal: 7000 },
          { name: 'Belfood Sosis Bakar', price: 27000, qty: 1, unit: 'pcs', subtotal: 27000 }
        ],
        total_amount: 70000,
        paid_amount: 70000,
        change_amount: 0,
        payment_method: 'Cash',
        created_at: '2023-08-02T08:46:36.000Z'
      }
    ];

    // Seed Business Profiles
    this.businessProfiles = [
      {
        id: 'bp-001',
        user_id: userFreeId,
        business_name: 'Warung Kelontong Berkah',
        category: 'Retail / Sembako',
        address_text: 'Jl. Melati No. 12, Jakarta Selatan',
        latitude: -6.2088,
        longitude: 106.8456,
        gmaps_url: 'https://maps.google.com/?q=Warung+Berkah',
        landing_page_slug: 'warung-berkah',
        updated_at: new Date().toISOString()
      },
      {
        id: 'bp-002',
        user_id: userPremId,
        business_name: 'Kopi Senja Premium',
        category: 'Food & Beverage',
        address_text: 'Jl. Senopati No. 45, Jakarta Selatan',
        latitude: -6.2311,
        longitude: 106.8099,
        gmaps_url: 'https://maps.google.com/?q=Kopi+Senja+Premium',
        landing_page_slug: 'kopi-senja-premium',
        updated_at: new Date().toISOString()
      }
    ];

    // Seed Tutorial Contents (Basic vs Premium Tiers)
    this.tutorialContents = [
      {
        id: 'tut-001',
        title: 'Cara Klaim & Verifikasi Google Maps Tempat Usaha',
        description: 'Panduan praktis mendaftarkan titik lokasi toko UMKM di Google Maps dan verifikasi instan.',
        module_category: 'Google Maps Optimization',
        video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration_seconds: 300,
        minimum_tier: 'FREE',
        is_active: true
      },
      {
        id: 'tut-002',
        title: 'Trik Mendapatkan 100+ Bintang 5 Review Pelanggan',
        description: 'Cara menggunakan QR Code Review interaktif untuk mendorong pembeli memberikan ulasan positif.',
        module_category: 'Review Management',
        video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration_seconds: 450,
        minimum_tier: 'FREE',
        is_active: true
      },
      {
        id: 'tut-003',
        title: 'Masterclass WhatsApp Automation & Landing Page High Conversion',
        description: 'Strategi membangun corong penjualan otomatis dari WhatsApp Blast hingga katalog produk digital.',
        module_category: 'Digital Marketing',
        video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration_seconds: 900,
        minimum_tier: 'PREMIUM',
        is_active: true
      },
      {
        id: 'tut-004',
        title: 'Strategi Ads Lokal Radius 3KM untuk Kafe & Retail',
        description: 'Tutorial setup iklan berbasis lokasi sekitar tempat usaha dengan anggaran hemat.',
        module_category: 'Local Advertising',
        video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration_seconds: 1200,
        minimum_tier: 'PREMIUM',
        is_active: true
      }
    ];

    // Seed Initial Service Request & Task
    const reqId = 'sr-001';
    this.serviceRequests.push({
      id: reqId,
      client_id: userFreeId,
      service_type: 'Optimasi Google Maps & Verifikasi Lapangan',
      current_status: 'ASSIGNED',
      requirement_notes: 'Bantu foto titik lokasi toko & pasang stiker QR Review',
      created_at: new Date().toISOString()
    });

    this.serviceTasks.push({
      id: 'st-001',
      request_id: reqId,
      consultant_id: agentId,
      task_step: 'Verifikasi Fisik & Geotag Location',
      proof_evidence_url: '',
      task_status: 'IN_PROGRESS',
      updated_at: new Date().toISOString()
    });

    // Seed Cashflow Records
    this.cashflowRecords = [
      {
        id: 'cf-001',
        owner_id: userFreeId,
        type: 'INCOME',
        category: 'PENJUALAN_HARIAN',
        amount: 450000,
        notes: 'Penjualan Toko Kelontong Pagi',
        date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString()
      },
      {
        id: 'cf-002',
        owner_id: userFreeId,
        type: 'EXPENSE',
        category: 'BAHAN_BAKU',
        amount: 180000,
        notes: 'Kulakan Minyak & Beras',
        date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString()
      },
      {
        id: 'cf-003',
        owner_id: userFreeId,
        type: 'EXPENSE',
        category: 'UTILITAS',
        amount: 50000,
        notes: 'Token Listrik Toko',
        date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString()
      }
    ];

    // Seed Customer Contacts (Harvested from POS receipts & QR review scans)
    this.customerContacts = [
      {
        id: 'cnt-001',
        owner_id: userFreeId,
        customer_name: 'Budi Raharjo',
        phone_number: '081299887766',
        source: 'POS_RECEIPT',
        total_visits: 5,
        total_spent: 320000,
        last_visit_date: '2026-08-15T10:00:00.000Z', // Inactive > 30 days
        created_at: new Date().toISOString()
      },
      {
        id: 'cnt-002',
        owner_id: userFreeId,
        customer_name: 'Maya Indah',
        phone_number: '089988776655',
        source: 'QR_REVIEW_SCAN',
        total_visits: 2,
        total_spent: 95000,
        last_visit_date: new Date().toISOString(),
        created_at: new Date().toISOString()
      }
    ];

    // Seed Inventory Items & Stock Alerts
    this.inventoryItems = [
      {
        id: 'inv-001',
        owner_id: userFreeId,
        item_name: 'Beras Premium 5kg',
        category: 'Sembako',
        unit_price: 65000,
        current_stock: 3,
        min_stock: 5, // Low stock trigger!
        supplier_name: 'CV Sembako Jaya',
        supplier_phone: '081233445566',
        updated_at: new Date().toISOString()
      },
      {
        id: 'inv-002',
        owner_id: userFreeId,
        item_name: 'Minyak Goreng 1L',
        category: 'Sembako',
        unit_price: 18000,
        current_stock: 12,
        min_stock: 10,
        supplier_name: 'Distributor Minyak Murah',
        supplier_phone: '081999888777',
        updated_at: new Date().toISOString()
      }
    ];

    // Seed Debt Books (Buku Bon Utang-Piutang)
    this.debtBooks = [
      {
        id: 'debt-001',
        owner_id: userFreeId,
        debtor_name: 'Pak Ahmad (Tetangga)',
        phone_number: '085211223344',
        type: 'RECEIVABLE', // Piutang (orang ngutang ke toko)
        amount: 75000,
        notes: 'Bon Beras & Gula Pasir',
        recorder_name: 'Dewi (Kasir)',
        due_date: '2026-10-01',
        status: 'UNPAID',
        created_at: new Date().toISOString()
      },
      {
        id: 'debt-002',
        owner_id: userFreeId,
        debtor_name: 'CV Agen Sembako Utama',
        phone_number: '081233445566',
        type: 'DEBT', // Utang toko ke agen
        amount: 250000,
        notes: 'Sisa Pembayaran Galon & Gas',
        recorder_name: 'Budi Santoso (Owner)',
        due_date: '2026-09-30',
        status: 'UNPAID',
        created_at: new Date().toISOString()
      }
    ];

    // Seed QRIS Transactions
    this.qrisTransactions = [
      {
        id: 'qris-1001',
        owner_id: userFreeId,
        amount: 101000,
        qr_string: '00020101021126620016ID.CO.QRIS.WWW011893600911000000000052045411530336054061010005802ID5913SuperUMKM Shop6007Jakarta6304A1B2',
        qr_code_svg: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=QRIS_DEMO_101000',
        status: 'SUCCESS', // PAID
        paid_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      }
    ];
  }
}

const db = new Database();
module.exports = db;
