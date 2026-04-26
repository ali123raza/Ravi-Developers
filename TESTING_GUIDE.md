# Ravi Developers Admin - Testing Guide

## Quick Test Checklist

### Phase 1 - Quick Wins ✅
- [ ] **Users Management** (`/admin/users`)
  - Add new admin user
  - Edit user role
  - Delete user
  - View user list

- [ ] **Gallery** (`/admin/gallery`)
  - Upload images to gallery
  - Delete images
  - View gallery grid

- [ ] **Files** (`/admin/files`)
  - View uploaded files list
  - Search files
  - Delete files

- [ ] **Activity Logs** (`/admin/logs`)
  - View recent activities
  - Filter by action type
  - Export logs

### Phase 2 - Business Features ✅
- [ ] **Bookings** (`/admin/bookings`)
  - Create new booking (requires available plot + customer)
  - Add payment to booking
  - Change booking status
  - Delete booking

- [ ] **Customers** (`/admin/customers`)
  - Add new customer
  - Edit customer details
  - View customer stats (bookings, payments)

- [ ] **Inquiries CRM** (`/admin/inquiries`)
  - View inquiries list
  - Expand inquiry details
  - **Convert inquiry to customer** (NEW!)
  - Add notes to inquiry

- [ ] **Reports** (`/admin/reports`)
  - View Sales Report (charts)
  - View Inquiry Report (conversion rates)
  - View Plots Report (availability)
  - Check summary cards

### Phase 3 - Advanced Features ✅
- [ ] **Marketing - Email** (`/admin/marketing`)
  - Create email campaign
  - Send campaign to recipients
  - View campaign stats

- [ ] **Marketing - SMS** (`/admin/marketing`)
  - Create SMS campaign
  - Send bulk SMS

- [ ] **Marketing - Promotions** (`/admin/marketing`)
  - Create discount code
  - Toggle active/inactive
  - Set expiration dates

- [ ] **System Health** (`/admin/system`)
  - View database health
  - Check table sizes
  - View entity counts
  - Create backup
  - Clear cache

## Database Setup Required

Run these SQL migrations to enable all features:

```bash
# Connect to MySQL and run:
source database/migrations.sql
source database/phase3_migrations.sql
```

## API Testing (via curl or Postman)

### Test Backend Health
```bash
curl http://localhost:3000/api/health
```

### Test Bookings API
```bash
# Get all bookings
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/bookings

# Get all customers
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/customers

# Get reports
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/reports/summary
```

## Navigation Structure

```
/admin                    Dashboard
├── /projects            Project Management
├── /plots               Plot Management
├── /inquiries           Inquiries + CRM
├── /bookings            Booking & Sales (NEW)
├── /customers           Customer CRM (NEW)
├── /testimonials        Testimonials
├── /reports             Analytics & Charts (NEW)
├── /marketing           Email/SMS/Promos (NEW)
├── /cms                 CMS Pages
├── /theme               Theme Settings
├── /navigation          Menu Navigation
├── /seo                 SEO Settings
├── /gallery             Image Gallery (NEW)
├── /files               File Manager (NEW)
├── /logs                Activity Logs (NEW)
├── /users               User Management (NEW)
├── /system              System Health (NEW)
└── /settings            Site Settings
```

## Feature Count
- **Phase 1**: 4 features (Users, Gallery, Files, Logs)
- **Phase 2**: 4 features (Bookings, Customers, Reports, Enhanced Inquiries)
- **Phase 3**: 2 features (Marketing, System)
- **Total**: 15+ admin features implemented!

## Troubleshooting

### Build Issues
```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### Database Connection
Check `.env` file has correct credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ravi_developers
```

### API Not Working
1. Ensure backend server is running: `node api/server.js`
2. Check CORS settings in `api/server.js`
3. Verify JWT secret is set

## Performance Notes

- All API calls use React Query with caching
- Health check auto-refreshes every 30 seconds
- Reports use Recharts for visualization
- Marketing campaigns support bulk operations
