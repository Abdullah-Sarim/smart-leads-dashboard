# Smart Leads Dashboard — API Documentation

## Base URL

```
http://localhost:5000/api
```

---

## Authentication

All protected endpoints require a valid JWT token in the `Authorization` header.

```
Authorization: Bearer <token>
```

- Tokens are issued upon successful login and expire after **7 days**
- Include the token in every request to protected routes
- If the token is missing or invalid, the server returns `401 Unauthorized`

---

## Response Formats

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

> The `meta` field is included only for paginated endpoints (e.g., `GET /leads`).

### Error Response

```json
{
  "success": false,
  "message": "Error description here",
  "errors": [
    {
      "message": "Invalid email address"
    }
  ]
}
```

> The `errors` array is included only when validation fails.

---

## HTTP Status Codes

| Code | Meaning                                          |
|------|--------------------------------------------------|
| 200  | OK — Request succeeded                          |
| 201  | Created — Resource was created                   |
| 400  | Bad Request — Validation or input error         |
| 401  | Unauthorized — Missing or invalid token          |
| 403  | Forbidden — Insufficient permissions             |
| 404  | Not Found — Resource does not exist              |
| 500  | Internal Server Error                            |

---

## Auth Endpoints

### POST `/api/auth/register`

Register a new user account.

**Body Parameters**

| Field    | Type   | Required | Description                    |
|----------|--------|----------|--------------------------------|
| name     | string | Yes      | Full name (min 2 chars)       |
| email    | string | Yes      | Valid email address           |
| password | string | Yes      | Password (min 6 chars)        |

**Example Request**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "secure123"
  }'
```

**Example Response (201 Created)**

```json
{
  "success": true,
  "data": {
    "_id": "66f1a2b3c4d5e6f7a8b9c0d1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "sales",
    "createdAt": "2025-10-14T12:00:00.000Z"
  }
}
```

**Error Response (400 Bad Request)**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "message": "Email already in use"
    }
  ]
}
```

---

### POST `/api/auth/login`

Authenticate a user and receive a JWT token.

**Body Parameters**

| Field    | Type   | Required | Description              |
|----------|--------|----------|--------------------------|
| email    | string | Yes      | Registered email address |
| password | string | Yes      | Account password         |

**Example Request**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@demo.com",
    "password": "admin123"
  }'
```

**Example Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "66f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Admin User",
      "email": "admin@demo.com",
      "role": "admin",
      "createdAt": "2025-10-01T09:00:00.000Z"
    }
  }
}
```

**Error Response (401 Unauthorized)**

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### GET `/api/auth/me`

Get the currently authenticated user's profile.

**Headers**

```
Authorization: Bearer <token>
```

**Example Request**

```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Example Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "_id": "66f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Admin User",
    "email": "admin@demo.com",
    "role": "admin",
    "createdAt": "2025-10-01T09:00:00.000Z"
  }
}
```

**Error Response (401 Unauthorized)**

```json
{
  "success": false,
  "message": "No token provided"
}
```

---

## Lead Endpoints

### GET `/api/leads`

Get a paginated and filtered list of leads.

**Headers**

```
Authorization: Bearer <token>
```

**Query Parameters**

| Parameter | Type   | Default  | Description                                      |
|-----------|--------|----------|--------------------------------------------------|
| `search`  | string | —        | Search by lead name or email                     |
| `status`  | string | —        | Filter by status: `New`, `Contacted`, `Qualified`, `Lost` |
| `source`  | string | —        | Filter by source: `Website`, `Instagram`, `Referral` |
| `sort`    | string | `latest` | Sort order: `latest` or `oldest`                 |
| `page`    | number | `1`      | Page number                                      |
| `limit`   | number | `10`     | Items per page (max 100)                         |

**Example Request**

```bash
curl "http://localhost:5000/api/leads?search=john&status=New&sort=latest&page=1&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Example Response (200 OK)**

```json
{
  "success": true,
  "data": [
    {
      "_id": "66f1a2b3c4d5e6f7a8b9c0d2",
      "name": "John Smith",
      "email": "john@example.com",
      "status": "New",
      "source": "Website",
      "createdAt": "2025-10-14T10:30:00.000Z",
      "updatedAt": "2025-10-14T10:30:00.000Z"
    },
    {
      "_id": "66f1a2b3c4d5e6f7a8b9c0d3",
      "name": "John Doe",
      "email": "johndoe@example.com",
      "status": "New",
      "source": "Instagram",
      "createdAt": "2025-10-13T08:15:00.000Z",
      "updatedAt": "2025-10-13T08:15:00.000Z"
    }
  ],
  "meta": {
    "total": 2,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

### GET `/api/leads/:id`

Get a single lead by its ID.

**Headers**

```
Authorization: Bearer <token>
```

**Example Request**

```bash
curl http://localhost:5000/api/leads/66f1a2b3c4d5e6f7a8b9c0d2 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Example Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "_id": "66f1a2b3c4d5e6f7a8b9c0d2",
    "name": "John Smith",
    "email": "john@example.com",
    "status": "New",
    "source": "Website",
    "createdAt": "2025-10-14T10:30:00.000Z",
    "updatedAt": "2025-10-14T10:30:00.000Z"
  }
}
```

**Error Response (404 Not Found)**

```json
{
  "success": false,
  "message": "Lead not found"
}
```

---

### POST `/api/leads`

Create a new lead.

**Headers**

```
Authorization: Bearer <token>
```

**Body Parameters**

| Field   | Type   | Required | Description                                        |
|---------|--------|----------|----------------------------------------------------|
| `name`  | string | Yes      | Lead's full name (min 2 chars)                     |
| `email` | string | Yes      | Valid email address                                |
| `status`| string | No       | Status: `New`, `Contacted`, `Qualified`, `Lost`. Defaults to `New` |
| `source`| string | No       | Source: `Website`, `Instagram`, `Referral`. Defaults to `Website` |

**Example Request**

```bash
curl -X POST http://localhost:5000/api/leads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "status": "New",
    "source": "Referral"
  }'
```

**Example Response (201 Created)**

```json
{
  "success": true,
  "data": {
    "_id": "66f1a2b3c4d5e6f7a8b9c0d4",
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "status": "New",
    "source": "Referral",
    "createdAt": "2025-10-14T14:00:00.000Z",
    "updatedAt": "2025-10-14T14:00:00.000Z"
  }
}
```

**Error Response (400 Bad Request)**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "message": "Email is required"
    }
  ]
}
```

---

### PUT `/api/leads/:id`

Update an existing lead.

**Headers**

```
Authorization: Bearer <token>
```

**Body Parameters**

All fields are optional. Only include fields you want to update.

| Field   | Type   | Description                                        |
|---------|--------|----------------------------------------------------|
| `name`  | string | Lead's full name                                   |
| `email` | string | Valid email address                                |
| `status`| string | Status: `New`, `Contacted`, `Qualified`, `Lost`    |
| `source`| string | Source: `Website`, `Instagram`, `Referral`        |

**Example Request**

```bash
curl -X PUT http://localhost:5000/api/leads/66f1a2b3c4d5e6f7a8b9c0d2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "status": "Contacted",
    "source": "Instagram"
  }'
```

**Example Response (200 OK)**

```json
{
  "success": true,
  "data": {
    "_id": "66f1a2b3c4d5e6f7a8b9c0d2",
    "name": "John Smith",
    "email": "john@example.com",
    "status": "Contacted",
    "source": "Instagram",
    "createdAt": "2025-10-14T10:30:00.000Z",
    "updatedAt": "2025-10-14T15:00:00.000Z"
  }
}
```

**Error Response (404 Not Found)**

```json
{
  "success": false,
  "message": "Lead not found"
}
```

---

### DELETE `/api/leads/:id`

Delete a lead. Only **Admin** users can delete leads.

**Headers**

```
Authorization: Bearer <token>
```

**Example Request**

```bash
curl -X DELETE http://localhost:5000/api/leads/66f1a2b3c4d5e6f7a8b9c0d2 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Example Response (200 OK)**

```json
{
  "success": true,
  "message": "Lead deleted successfully"
}
```

**Error Response (403 Forbidden)**

```json
{
  "success": false,
  "message": "Admin access required"
}
```

---

### GET `/api/leads/export/csv`

Export leads as a CSV file. Respects current filter state (search, status, source, sort).

**Headers**

```
Authorization: Bearer <token>
```

**Query Parameters**

Same as `GET /api/leads` — filters applied here are reflected in the export.

| Parameter | Type   | Description                                      |
|-----------|--------|--------------------------------------------------|
| `search`  | string | Search by name or email                          |
| `status`  | string | Filter by status                                 |
| `source`  | string | Filter by source                                 |
| `sort`    | string | Sort order: `latest` or `oldest`                |

**Example Request**

```bash
curl "http://localhost:5000/api/leads/export/csv?status=Qualified&sort=latest" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -o leads_export.csv
```

**Response**

Returns a CSV file with the following headers:

```csv
Name,Email,Status,Source,Created At
John Smith,john@example.com,Qualified,Website,2025-10-14 10:30 AM
Alice Johnson,alice@example.com,Qualified,Referral,2025-10-13 09:00 AM
```

**Content-Type:** `text/csv`
**Content-Disposition:** `attachment; filename="leads_export.csv"`

---

## Query Parameters Reference

### Filtering by Status

```bash
GET /api/leads?status=New
GET /api/leads?status=Contacted
GET /api/leads?status=Qualified
GET /api/leads?status=Lost
```

### Filtering by Source

```bash
GET /api/leads?source=Website
GET /api/leads?source=Instagram
GET /api/leads?source=Referral
```

### Searching by Name or Email

```bash
GET /api/leads?search=john
GET /api/leads?search=example.com
```

### Sorting

```bash
GET /api/leads?sort=latest      # Newest first (default)
GET /api/leads?sort=oldest      # Oldest first
```

### Pagination

```bash
GET /api/leads?page=1&limit=10    # Page 1, 10 items (default)
GET /api/leads?page=2&limit=20    # Page 2, 20 items
```

### Combined Filters

```bash
GET /api/leads?search=john&status=New&source=Website&sort=latest&page=1&limit=10
```

---

## Role Restrictions Summary

| Endpoint                    | Admin | Sales User |
|-----------------------------|:-----:|:----------:|
| POST /api/auth/register     |  ✓   |     ✗     |
| POST /api/auth/login        |  ✓   |     ✓     |
| GET /api/auth/me            |  ✓   |     ✓     |
| GET /api/leads              |  ✓   |     ✓     |
| GET /api/leads/:id          |  ✓   |     ✓     |
| POST /api/leads             |  ✓   |     ✓     |
| PUT /api/leads/:id          |  ✓   |     ✓     |
| DELETE /api/leads/:id       |  ✓   |     ✗     |
| GET /api/leads/export/csv   |  ✓   |     ✓     |

---

## Rate Limiting

The API applies a general rate limit to `/api` routes. By default it allows **1000 requests per IP per 15 minutes**, configurable through environment variables.

If the limit is exceeded, the server returns:

```json
{
  "success": false,
  "message": "Too many requests, please try again later"
}
```

---

## Security Headers

The API includes the following security headers via Helmet:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `X-DNS-Prefetch-Control: off`
- `X-Download-Options: noopen`

CORS is configured to allow requests only from the frontend origin (`CLIENT_URL`).

---

*Last updated: May 2026*