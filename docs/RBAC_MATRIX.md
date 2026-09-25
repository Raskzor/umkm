# Role-Based Access Control (RBAC) Matrix

## Roles Defined
1. **UMKM Owner (Free / Basic)** (`UMKM_OWNER_FREE`)
2. **UMKM Owner (Premium)** (`UMKM_OWNER_PREMIUM`)
3. **Consultant / Field Agent** (`FIELD_AGENT`)
4. **Super Admin** (`SUPER_ADMIN`)

## Detailed Permission Table

| Module / Feature | UMKM Owner (Free) | UMKM Owner (Premium) | Consultant / Field Agent | Super Admin |
| :--- | :---: | :---: | :---: | :---: |
| **Self-Audit (Health Check)** | Read / Execute | Read / Execute | Read All | Read All |
| **Video Micro-Tutorials** | Read (Basic Tier) | Read (All Tiers) | Read | Manage / Upload |
| **QR Code Review Generator** | Generate Basic PDF | Custom Branding PDF | Read / Assist | Manage Templates |
| **Landing Page / Mini Catalog** | 1 Page (Subdomain) | Multi-section + Custom WA | Assist Setup | Manage / Deploy |
| **Consultation Ticket / Service Request** | Basic (Async Ticket) | Priority 1-on-1 Chat | Handle & Resolve | Audit / Assign |
| **Field Execution (Pin Maps / Evidence)** | View Status | View Status + Report | Update Progress & Geotag | Full Oversight |
| **User & Subscription Management** | Self Profile | Self Profile | Read Assigned Client | Full CRUD |

## Enforcement Mechanism
Authorization is enforced via the Express RBAC middleware `authorizeRoles(...allowedRoles)` attached to all protected API routes.
