# Matriks Hak Akses Staf & Peran Pengguna

## Roles Defined
1. **UMKM Owner (Free / Basic)** (`UMKM_OWNER_FREE`) - Default account for basic digital audit, toko online instan, & basic POS (Max 1 staf kasir).
2. **UMKM Owner (Premium)** (`UMKM_OWNER_PREMIUM`) - Unlocked full feature tier with priority support, unlimited staf kasir, dynamic QRIS, & priority route.
3. **Staf Kasir Toko** (`CASHIER`) - Store cashier account for transaction entry, receipt printing, & bon recording.
4. **Consultant / Field Agent** (`FIELD_AGENT`) - Field support consultant assisting local UMKMs with geotag proofing.
5. **Super Admin** (`SUPER_ADMIN`) - Full system administration, user management, & audit oversight.

## Detailed Permission Table

| Module / Feature | UMKM Owner (Free) | UMKM Owner (Premium) | Staf Kasir Toko | Consultant / Field Agent | Super Admin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Self-Audit & Action Center** | Read / Execute | Read / Execute | No Access | Read All | Read All / Manage |
| **Google Maps & QR Review** | Standard PDF | Custom Branded PDF | Read / Print | Assist Setup | Manage Templates |
| **Mini Website & Toko Instan** | 1 Clean Store Slug | Multi-section + WA | Read Catalog | Assist Setup | Manage / Deploy |
| **POS Instant (Kasir)** | Full Access | Full Access | Transaction Entry | View Reports | Full Access |
| **Kelola Staf Kasir** | **Max 1 Staf Kasir** | **Unlimited Staf Kasir** | No Access | No Access | Full Manage |
| **Cashflow & P&L Saku** | Read / Create | Read / Create / Export | Create Entry | View Summary | Full Access |
| **Smart WA Broadcast & Loyalty**| Basic Contacts | Full Churn Alert & WA | View Contacts | Assist Broadcast | Full Access |
| **Stok, Bon & Supplier Order** | Low Stock Alert | Unlimited Re-Order | Record Bon | View Stock | Full Access |
| **AI Promo & Poster Generator**| Standard Tone | Priority AI & Poster | No Access | Assist Copywriting| Full Access |
| **Integrasi QRIS Kasir** | Static QRIS | Dynamic QRIS + Verify | Generate & Scan | Assist Setup | Full Access |
| **Marketplace & Komunitas** | View & Post Basic | Priority Listing & Forum | View Only | Moderation Assist | Full Manage |
| **Consultation Ticket** | Basic (Async Ticket) | Priority 1-on-1 Chat | No Access | Handle & Resolve | Audit / Assign |
| **Field Execution (Pin Maps)** | View Status | View Status + Report | No Access | Update Geotag | Full Oversight |

## Enforcement Mechanism
Authorization is enforced via Express middleware `authenticate`, `authorizeRoles(...)`, and `authorizeTier(...)` attached to all protected API routes, with plan limit checks on POS staff creation endpoints.
