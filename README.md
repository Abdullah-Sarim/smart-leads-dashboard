# Smart Leads Dashboard

A production-quality full-stack MERN application for managing sales leads with role-based access control.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, TailwindCSS, Vite |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB, Mongoose ODM |
| Auth | JWT, bcrypt, express-validator |
| State | Zustand (client), Redis-ready middleware |

## Features

- [x] JWT Authentication
- [x] User Registration & Login
- [x] Password Hashing (bcrypt)
- [x] Protected Routes
- [x] Auth Middleware
- [x] Lead CRUD
- [x] Lead Fields: name, email, status, source, createdAt
- [x] Status values: New, Contacted, Qualified, Lost
- [x] Source values: Website, Instagram, Referral
- [x] Advanced Filtering (status + source)
- [x] Search by name/email
- [x] Sort by latest/oldest
- [x] Combined Filters
- [x] Backend Pagination (10/page)
- [x] Pagination metadata
- [x] Debounced Search
- [x] CSV Export
- [x] Role-Based Access Control (Admin / Sales User)
- [x] Docker Setup
- [x] .env.example
- [x] Loading / Empty / Error States
- [x] Form Validation

## Project Structure

```
LeadDashboard/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── common/        # Button, Input, Select, StatusViews
│   │   │   ├── layout/        # Navbar, Layout
│   │   │   └── leads/         # LeadForm, LeadsTable, FilterBar, Pagination
│   │   ├── hooks/             # Custom hooks (useDebounce, useAuth)
│   │   ├── pages/             # Route pages (Login, Register, Dashboard, Landing)
│   │   ├── services/          # API services (api, auth, leads)
│   │   ├── store/             # Zustand state (auth store)
│   │   ├── types/             # TypeScript types & enums
│   │   └── utils/             # Validation schemas, helpers
│   └── public/
├── server/                     # Node/Express backend
│   ├── src/
│   │   ├── config/            # Database, app config
│   │   ├── controllers/       # Request handlers
│   │   ├── middleware/        # Auth, validation middleware
│   │   ├── models/            # Mongoose schemas (User, Lead)
│   │   ├── routes/            # Express routers
│   │   ├── services/          # Business logic
│   │   ├── types/             # Shared TypeScript types
│   │   ├── utils/             # Response helpers
│   │   └── index.ts           # App entry point
│   └── .env.example
├── docker-compose.yml
├── Dockerfile
└── package.json
```

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /auth/register | Register new user | No |
| POST | /auth/login | Login user | No |
| GET | /auth/profile | Get current user | Yes |
| GET | /auth/users | Get all users | Admin |

### Leads

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /leads | Get paginated leads | Yes |
| POST | /leads | Create lead | Yes |
| GET | /leads/:id | Get single lead | Yes |
| PUT | /leads/:id | Update lead | Yes |
| DELETE | /leads/:id | Delete lead | Yes |
| GET | /leads/export | Export CSV | Yes |

### Query Parameters

```
?page=1&limit=10&search=john&status=New&source=Website&sortBy=createdAt&order=desc
```

### Response Format

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

## Setup

### Prerequisites
- Node.js 20+
- MongoDB 7+
- Docker (optional)

### Installation

```bash
# Clone the repo
cd LeadDashboard

# Install all dependencies
npm run install:all

# Create .env files
cp server/.env.example server/.env
cp client/.env.example client/.env

# Start MongoDB locally, then:
npm run dev
```

### Docker

```bash
docker-compose up -d
```

App runs at http://localhost:3000

### Manual Dev

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

Server: http://localhost:5000
Client: http://localhost:5173

## Environment Variables

### Server (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment | development |
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/leaddashboard |
| JWT_SECRET | JWT signing secret | - |
| JWT_EXPIRES_IN | Token expiry | 7d |
| BCRYPT_SALT | Password hashing rounds | 12 |

### Client (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | http://localhost:5000/api |

## Demo Credentials

After seeding data, use:

- **Admin:** admin@demo.com / admin123
- **Sales User:** sales@demo.com / sales123

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Run both server & client concurrently |
| `npm run dev:server` | Run backend only |
| `npm run dev:client` | Run frontend only |
| `npm run build` | Build both for production |
| `npm run install:all` | Install all dependencies |

## Design Decisions

1. **Monorepo structure** — Clean separation, shared types between server/client
2. **Service layer** — Business logic isolated from controllers for testability
3. **Zustand for state** — Minimal, TypeScript-friendly state management without boilerplate
4. **Debounced search** — 500ms delay to prevent API spam while typing
5. **Pagination on backend** — Scalable; client just displays metadata
6. **CSV export from backend** — Streams file, respects filters; no frontend memory issues
7. **RBAC via middleware** — Middleware checks role before controller logic runs
8. **express-validator** — Schema-based validation with consistent error format

## License

MIT