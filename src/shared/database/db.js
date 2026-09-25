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

    this.seed();
  }

  seed() {
    // Seed Users (4 RBAC Roles)
    const userFreeId = 'u-free-001';
    const userPremId = 'u-prem-002';
    const agentId = 'u-agent-003';
    const adminId = 'u-admin-004';

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
        module_category: 'Google Maps Optimization',
        video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration_seconds: 300,
        minimum_tier: 'FREE',
        is_active: true
      },
      {
        id: 'tut-002',
        title: 'Trik Mendapatkan 100+ Bintang 5 Review Pelanggan',
        module_category: 'Review Management',
        video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration_seconds: 450,
        minimum_tier: 'FREE',
        is_active: true
      },
      {
        id: 'tut-003',
        title: 'Masterclass WhatsApp Automation & Landing Page High Conversion',
        module_category: 'Digital Marketing',
        video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duration_seconds: 900,
        minimum_tier: 'PREMIUM',
        is_active: true
      },
      {
        id: 'tut-004',
        title: 'Strategi Ads Lokal Radius 3KM untuk Kafe & Retail',
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
  }
}

const db = new Database();
module.exports = db;
