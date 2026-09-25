# Role-Based Access Control (RBAC) Matrix

## Roles Defined
1. **UMKM Owner (Free / Basic)** (`UMKM_OWNER_FREE`) - Default account for basic digital audit & temporary site.
2. **UMKM Owner (Premium)** (`UMKM_OWNER_PREMIUM`) - Unlocked full feature tier with priority support & unlimited staff.
3. **Cashier / Staff (Anak Buah)** (`CASHIER`) - Store cashier account for transaction entry & receipt generation.
4. **Consultant / Field Agent** (`FIELD_AGENT`) - Field support consultant assisting local UMKMs.
5. **Super Admin** (`SUPER_ADMIN`) - Full system administration & audit oversight.

## Detailed Permission Table

| Module / Feature | UMKM Owner (Free) | UMKM Owner (Premium) | Cashier (Anak Buah) | Consultant / Field Agent | Super Admin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Self-Audit (Health Check)** | Read / Execute | Read / Execute | No Access | Read All | Read All |
| **Video Micro-Tutorials** | Read (Basic Tier) | Read (All Tiers) | Read | Read | Manage / Upload |
| **QR Code Review Generator** | Generate Basic PDF | Custom Branding PDF | Read / Print | Read / Assist | Manage Templates |
| **Landing Page / Mini Catalog** | 1 Page (Subdomain) | Multi-section + Custom WA | Read Catalog | Assist Setup | Manage / Deploy |
| **Point of Sale (POS Kasir)** | Full Access | Full Access | Transaction Entry | View Reports | Full Access |
| **Staff Assignment (Kasir)** | **Max 1 Staff** | **Unlimited Staff** | No Access | No Access | Full Manage |
| **Consultation Ticket** | Basic (Async Ticket) | Priority 1-on-1 Chat | No Access | Handle & Resolve | Audit / Assign |
| **Field Execution (Pin Maps)** | View Status | View Status + Report | No Access | Update Geotag | Full Oversight |

## Enforcement Mechanism
Authorization is enforced via Express RBAC middleware `authorizeRoles(...allowedRoles)` attached to all protected API routes, with plan limit checks on POS staff creation endpoints.
