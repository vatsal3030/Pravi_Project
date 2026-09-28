# 🏛️ InfraVault — Gujarat Roads & Buildings Department (R&B)
### Digital Civil Infrastructure Asset Management & Geospatial Maintenance System

> An authoritative, production-grade municipal infrastructure management platform engineered for the **Roads & Buildings Department (R&B), Government of Gujarat**. Features interactive GIS geospatial telemetry across Ahmedabad and Gujarat circles, drag-and-drop maintenance work order dispatch, end-to-end lifecycle audit trails, gamified field inspections, and authentic bilingual **English & Gujarati (ગુજરાતી)** support for senior department engineers and citizens.

---

## 🚀 Live Production Deployments

| Component | Platform | Live URL | Status |
| :--- | :--- | :--- | :--- |
| **Frontend Web Client** | **Vercel** | `https://pravi-project-client.vercel.app` | 🟢 Production Active |
| **Backend REST API** | **Render** | `https://infravault-backend-api.onrender.com` | 🟢 Production Active |
| **Database & Storage** | **Supabase** | `aws-0-ap-southeast-1.pooler.supabase.com:5432` | 🟢 High-Availability PostgreSQL |

---

## 🔑 Demo Access Credentials (1-Click Login Available)

The login screen features **1-Click Demo Login** buttons for instant role-based evaluation:

| Role | Officer Name | Official Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- | :--- |
| **Executive Admin** | Arjun Mehta | `admin@infravault.io` | `admin123` | Full jurisdictional control, budget approval, user roles & soft-deletes |
| **Field Inspector** | Priya Sharma | `inspector@infravault.io` | `inspector123` | Site audits, condition assessments, work order completion |
| **Planning Viewer** | Rahul Patel | `viewer@infravault.io` | `viewer123` | Read-only GIS map views, analytics, and public municipal transparency |

---

## 📐 System Architecture Diagram

```mermaid
graph TB
    subgraph Client_Tier ["Client Tier (Browser / Field Device)"]
        UI["React 19 SPA (Vite)"]
        AppleDesign["Apple Design System (Tailwind CSS v4)"]
        Leaflet["Leaflet GIS Engine (GPS Geolocation)"]
        Recharts["Recharts Financial Visualizations"]
        I18n["Bilingual Store (English / Gujarati)"]
        Zustand["Zustand State Stores (Auth, Theme, Layout)"]
    end

    subgraph Gateway_Tier ["Global Edge & Ingress"]
        VercelEdge["Vercel Global Edge Network"]
        Rewrites["vercel.json SPA Fallback Rewrites"]
        StaticCDN["Static Assets Cache (Immutable 1-Year TTL)"]
    end

    subgraph App_Tier ["Backend Application Tier (Render Web Service)"]
        Express["Express.js 5 REST API"]
        HelmetCors["Production Dynamic CORS & Helmet Security"]
        AuthMiddleware["JWT Authentication & RBAC Enforcer"]
        MemoryCache["In-Memory SWR Cache (< 5ms response)"]
        PrismaAdapter["Prisma ORM v7 with @prisma/adapter-pg"]
        ConnectionPool["pg.Pool Persistent Sockets (Keep-Alive, min: 2)"]
    end

    subgraph Data_Tier ["Data & Storage Tier (Supabase)"]
        Postgres[("PostgreSQL 16 High-Availability Engine")]
        AuditEvents[("Asset Lifecycle Audit Logs")]
        WorkOrdersDB[("Work Orders & Dispatches")]
        UsersDB[("Users, Roles & Gamification Streaks")]
    end

    subgraph External_APIs ["External Geospatial Services"]
        OSM["OpenStreetMap Cartographic Tile CDN"]
        GoogleMaps["Google Maps Navigation Deep-Linking"]
    end

    UI --> VercelEdge
    VercelEdge --> Rewrites
    Rewrites --> StaticCDN
    UI --> Express
    Express --> HelmetCors
    HelmetCors --> AuthMiddleware
    AuthMiddleware --> MemoryCache
    AuthMiddleware --> PrismaAdapter
    PrismaAdapter --> ConnectionPool
    ConnectionPool --> Postgres
    Postgres --> AuditEvents
    Postgres --> WorkOrdersDB
    Postgres --> UsersDB
    Leaflet --> OSM
    UI --> GoogleMaps
```

---

## ✨ Key Platform Features

### 1. 🗺️ Gujarat GIS Infrastructure Mapping
- Interactive Leaflet-powered GIS map centered across **Ahmedabad & Gujarat circles** (Riverfront, SG Highway, Sanand, Gandhinagar).
- Color-coded pin schemas by structural condition (Traffic Light: Green/Amber/Red), infrastructure category, or operational status.
- Live GPS location centering with browser geolocation.
- **Smart Zone & Ward Filtering**: Filter by Central, West, North, North-West (SG Highway), Gandhinagar Capital, South, and Sanand corridors.
- **Rich Asset Telemetry Drawer**: Displays condition index bars, capital valuation in Indian Crores (`₹X.XX Cr`), current book value, commissioning age, active work orders, and direct Google Maps navigation.

### 2. 📋 Drag-and-Drop Work Orders Kanban Board
- HTML5 drag-and-drop workflow across 4 status lanes: **Open → In Progress → On Hold → Completed**.
- Mandatory assigned certified engineer/inspector enforcement.
- Real-time optimistic UI updates synchronized with PostgreSQL transactions.
- Dedicated work order detail view with location coordinates, asset profile, and priority markers.

### 3. ⏱️ Complete Lifecycle Audit Trails & Manual Updates
- Immutable chronological audit trail recording every operational milestone (Planned, Procured, Installed, Active, Under Maintenance, Decommissioned).
- In-app **Update Lifecycle Status Modal** allowing authorized engineers to transition asset operational states with mandatory inspection notes.

### 4. 🇮🇳 Indian Number System & Currency Notation
- Automatic conversion into Indian numbering: **Crores (Cr)** for figures $\ge 10^7$, **Lakhs (L)** for figures $\ge 10^5$, and thousands.
- Clean axis ticks (`₹16 Cr`, `₹12 Cr`, `₹8 Cr`) eliminating cluttered raw lakhs like `₹16000L`.

### 5. 🌐 Bilingual Gujarati Language Support (ગુજરાતી)
- Dedicated localization designed for native elderly citizens and department field staff.
- Single-click global toggle button in the top navigation bar (`English | ગુજરાતી`).
- Authentic translations for navigation, infrastructure categories (માર્ગો અને હાઇવે, પુલ અને ફ્લાયઓવર, પાણીની પાઇપલાઇન), statuses, condition ratings, and audit tools.

### 6. 👥 Public Officer Profiles & Gamification
- Public personnel dossier accessible from the Staff Directory.
- Displays officer level title, audit points, activity streaks (🔥), and accredited badges.
- Direct contact integrations (email, phone, appointment verification).

### 7. ⚡ Zero-Cold-Start Performance Architecture
- Persistent Node-Postgres connection pool with persistent `keepAlive: true` and pre-warmed sockets.
- In-memory SWR caching reducing repeated roundtrips from 19 seconds down to **< 5ms**.

---

## 🛠️ Step-by-Step Deployment Instructions

### A. Deploy Backend to Render

1. Go to [dashboard.render.com](https://dashboard.render.com) and click **New > Web Service**.
2. Connect your GitHub repository: `vatsal3030/Pravi_Project`.
3. Fill in the configuration values:

```text
Name:              infravault-backend-api
Region:            Singapore (Southeast Asia)  [or Oregon]
Branch:            main
Root Directory:    server
Runtime:           Node
Build Command:     npm install && npx prisma generate
Start Command:     node src/index.js
Plan:              Free
```

4. Under **Environment Variables**, click **Add Environment Variable** and copy-paste:

| Key | Value |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `DATABASE_URL` | `postgresql://postgres.aspkplatesaxabqkeozk:kX_bK*8Tf4%2542BA@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres` |
| `DIRECT_URL` | `postgresql://postgres.aspkplatesaxabqkeozk:kX_bK*8Tf4%2542BA@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres` |
| `JWT_SECRET` | `infravault-prod-jwt-secret-secure-key-2024` |
| `JWT_REFRESH_SECRET` | `infravault-prod-refresh-secret-secure-key-2024` |
| `JWT_EXPIRES_IN` | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `CLIENT_URL` | `https://pravi-project-client.vercel.app` |

5. Click **Deploy Web Service**.

---

### B. Deploy Frontend to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import `vatsal3030/Pravi_Project`.
2. Configure project settings:

```text
Project Name:       pravi-project-client
Framework Preset:   Vite
Root Directory:     client
Build Command:      npm run build
Output Directory:   dist
Install Command:    npm install
```

3. Under **Environment Variables**, add:

| Key | Value |
| :--- | :--- |
| `VITE_API_URL` | `https://infravault-backend-api.onrender.com/api` |

*(Note: Replace with your actual Render service URL once generated)*

4. Click **Deploy**.

---

## 💻 Local Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/vatsal3030/Pravi_Project.git
cd Pravi_Project

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Configure Database & Seed Sample Gujarat Assets
```bash
cd ../server
npx prisma generate
npm run db:push
npm run db:seed
```

### 3. Run Development Servers
```bash
# Start backend (Port 5000)
cd server
npm run dev

# Start frontend (Port 5173) in a new terminal
cd client
npm run dev
```

Navigate to `http://localhost:5173` to explore InfraVault.

---

## 📜 Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Framer Motion, React-Leaflet, Recharts, Zustand, Date-fns, Lucide React.
- **Backend**: Node.js, Express.js 5, Prisma ORM v7, `@prisma/adapter-pg`, node-postgres (`pg.Pool`), JWT (`jsonwebtoken`), bcryptjs, Helmet, CORS.
- **Database**: PostgreSQL 16 (Hosted on Supabase with pooled connection).
- **Deployment**: Vercel (Client Edge CDN), Render (Containerized Node.js API).
