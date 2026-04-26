# API Routes Scan and Test Plan

Scan all backend API routes and create comprehensive tests for 50+ endpoints across 9 modules.

## Project Structure Found

**Base URL:** `http://localhost:3000/api`

### Route Modules (9 Total)

| Module | Base Path | Endpoints | Auth Required |
|--------|-----------|-----------|---------------|
| `auth.js` | `/api/auth` | 2 | No |
| `projects.js` | `/api/projects` | 5 | Yes (admin for mutations) |
| `plots.js` | `/api/plots` | 5 | Yes (admin for mutations) |
| `inquiries.js` | `/api/inquiries` | 5 | Partial |
| `users.js` | `/api/users` | 5 | Yes (admin) |
| `testimonials.js` | `/api/testimonials` | 5 | Partial |
| `settings.js` | `/api/settings` | 3 | Partial |
| `upload.js` | `/api/upload` | 2 | Yes (implied) |
| `dashboard.js` | `/api/dashboard` | 1 | Yes (admin) |

### Detailed Endpoint List

**Auth Routes** (`/api/auth`):
- `POST /login` - Login with email/password → returns JWT token
- `GET /me` - Get current user (requires Bearer token)

**Projects** (`/api/projects`):
- `GET /` - List all projects (public)
- `GET /:id` - Get single project (public)
- `POST /` - Create project (admin)
- `PUT /:id` - Update project (admin)
- `DELETE /:id` - Delete project (admin)

**Plots** (`/api/plots`):
- `GET /` - List plots (optional ?projectId filter, public)
- `GET /:id` - Get single plot (public)
- `POST /` - Create plot (admin)
- `PUT /:id` - Update plot (admin)
- `DELETE /:id` - Delete plot (admin)

**Inquiries** (`/api/inquiries`):
- `GET /` - List all inquiries (admin only)
- `GET /:id` - Get single inquiry (admin only)
- `POST /` - Create inquiry (public)
- `PUT /:id` - Update inquiry status (admin)
- `DELETE /:id` - Delete inquiry (admin)

**Users** (`/api/users`):
- `GET /` - List users (admin only)
- `GET /:id` - Get single user (admin only)
- `POST /` - Create user (admin only)
- `PUT /:id` - Update user (admin only)
- `DELETE /:id` - Delete user (admin only)

**Testimonials** (`/api/testimonials`):
- `GET /` - List testimonials (public)
- `GET /:id` - Get single testimonial (public)
- `POST /` - Create testimonial (admin)
- `PUT /:id` - Update testimonial (admin)
- `DELETE /:id` - Delete testimonial (admin)

**Settings** (`/api/settings`):
- `GET /` - Get all settings (public)
- `GET /:key` - Get single setting (public)
- `PUT /:key` - Update setting (admin)

**Upload** (`/api/upload`):
- `POST /` - Upload single file (image)
- `POST /multiple` - Upload multiple files (up to 10)

**Dashboard** (`/api/dashboard`):
- `GET /` - Get dashboard stats (admin)

**Health Check**:
- `GET /api/health` - Server status check

## Test Plan

1. **Public Routes Test** - No authentication required
2. **Auth Routes Test** - Login and token validation
3. **Protected Routes Test** - With valid admin token
4. **Error Cases** - 401, 403, 404 responses

## Implementation

Create `test-routes.js` script that:
- Tests all public GET endpoints
- Tests login flow
- Tests admin-protected routes with JWT
- Reports pass/fail for each endpoint
