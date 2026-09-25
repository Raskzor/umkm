# Business Consultant UMKM Platform - System Architecture Specification

## 1. System Overview
Platform pendampingan dan konsultasi digital UMKM segmen Menengah-Bawah (Google Maps Optimization, Review Management, Landing Page Builder, dan Video Edukasi Mandiri).

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │                           Client Layer                                 │
 │  ┌───────────────────┐  ┌───────────────────┐  ┌────────────────────┐ │
 │  │ UMKM Owner Portal │  │ Field Agent Mobile│  │ Super Admin Portal │ │
 │  └─────────┬─────────┘  └─────────┬─────────┘  └─────────┬──────────┘ │
 └────────────┼──────────────────────┼──────────────────────┼────────────┘
              │                      │                      │
 ┌────────────▼──────────────────────▼──────────────────────▼────────────┐
 │                            API Gateway / Express Router               │
 │  ┌─────────────────────────────────────────────────────────────────┐  │
 │  │ JWT & RBAC Middleware Guard (Free, Premium, Agent, Admin)      │  │
 │  └─────────────────────────────────────────────────────────────────┘  │
 └────────────┬─────────────────────────────────────────────┬────────────┘
              │                                             │
 ┌────────────▼─────────────────────────────────────────────▼────────────┐
 │                          Core Modules Engine                          │
 │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
 │  │ Auth Module  │ │ Audit Module │ │ GMaps Module │ │Landing Module│  │
 │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘  │
 │  ┌───────────────────────────────┐ ┌───────────────────────────────┐  │
 │  │      Learning Module          │ │       Services Module         │  │
 │  └───────────────────────────────┘ └───────────────────────────────┘  │
 └────────────┬─────────────────────────────────────────────┬────────────┘
              │                                             │
 ┌────────────▼─────────────────────────────────────────────▼────────────┐
 │                           Persistence Layer                           │
 │ ┌───────────────────────────────────────────────────────────────────┐ │
 │ │ PostgreSQL / SQLite Database (Users, Profiles, Audit, Tasks, etc) │ │
 │ └───────────────────────────────────────────────────────────────────┘ │
 └───────────────────────────────────────────────────────────────────────┘
```

## 2. Technology Stack
- **Runtime & Language**: Node.js, JavaScript (ES6+) / TypeScript
- **Web & API Framework**: Express.js REST API
- **Frontend Layer**: HTML5, Modern Vanilla CSS (Glassmorphism & Responsive System), Client-side JS
- **Database Engine**: PostgreSQL compatible schema (Knex / SQLite / In-Memory persistence)
- **Authentication**: JWT (JSON Web Tokens) with RBAC Middleware

## 3. Database Schema (Entity Relationship Diagram)
```mermaid
erDiagram
    USERS ||--o{ BUSINESS_PROFILES : owns
    USERS ||--o{ AUDIT_LOGS : takes
    USERS ||--o{ SERVICE_REQUESTS : orders
    USERS ||--o{ CONSULTANT_ASSIGNMENTS : assigned_to

    USERS {
        uuid id PK
        varchar phone_number UK
        varchar full_name
        varchar role_code
        varchar status
        timestamp created_at
    }

    BUSINESS_PROFILES {
        uuid id PK
        uuid user_id FK
        varchar business_name
        varchar category
        text address_text
        decimal latitude
        decimal longitude
        varchar gmaps_url
        varchar landing_page_slug UK
        timestamp updated_at
    }

    AUDIT_LOGS {
        uuid id PK
        uuid user_id FK
        uuid business_id FK
        integer health_score
        jsonb audit_answers
        jsonb recommendations
        timestamp created_at
    }

    SERVICE_REQUESTS {
        uuid id PK
        uuid client_id FK
        varchar service_type
        varchar current_status
        text requirement_notes
        timestamp created_at
    }

    SERVICE_TASKS {
        uuid id PK
        uuid request_id FK
        uuid consultant_id FK
        varchar task_step
        text proof_evidence_url
        varchar task_status
        timestamp updated_at
    }

    TUTORIAL_CONTENTS {
        uuid id PK
        varchar title
        varchar module_category
        text video_url
        integer duration_seconds
        varchar minimum_tier
        boolean is_active
    }
```

## 4. REST API Endpoint Registry

### Auth Module (`/api/v1/auth`)
- `POST /api/v1/auth/register` - User Registration (UMKM Owner, Field Agent, Admin)
- `POST /api/v1/auth/login` - Authenticate & obtain JWT
- `GET /api/v1/auth/me` - Get Current User Profile & RBAC Role

### Audit Module (`/api/v1/audit`)
- `POST /api/v1/audit/evaluate` - Execute Business Health Check (Calculate score 0-100 & action checklist)
- `GET /api/v1/audit/history` - Retrieve audit history for user business

### GMaps & QR Review Module (`/api/v1/gmaps`)
- `POST /api/v1/gmaps/qr-generate` - Generate QR Review template config
- `GET /api/v1/gmaps/checklist` - Get Google Maps optimization checklist

### Landing Page Builder (`/api/v1/landing`)
- `POST /api/v1/landing/create` - Build landing page / catalog slug
- `GET /api/v1/landing/:slug` - Public access for published catalog & WhatsApp hook

### Learning & Micro-Courses (`/api/v1/learning`)
- `GET /api/v1/learning/courses` - Fetch video tutorials filtered by user tier (Basic vs Premium)
- `POST /api/v1/learning/courses` - Upload/Manage tutorial (Admin only)

### Services & Ticketing (`/api/v1/services`)
- `POST /api/v1/services/order` - Request field service (Maps verification, QR printing, etc)
- `GET /api/v1/services/tasks` - List tasks (Filtered by role: Client vs Field Agent vs Admin)
- `PATCH /api/v1/services/tasks/:id/assign` - Assign field consultant (Admin only)
- `POST /api/v1/services/tasks/:id/evidence` - Upload geotagged completion proof (Agent only)
- `PATCH /api/v1/services/tasks/:id/status` - Update lifecycle status (IN_PROGRESS, COMPLETED, CLOSED)
