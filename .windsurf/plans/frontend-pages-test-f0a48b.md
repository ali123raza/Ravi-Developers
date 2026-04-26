# Frontend Pages Test Plan

Test all 17 frontend pages for rendering, errors, and basic functionality.

## Pages Found (17 Total)

### Public Pages (7)
| Route | Component | Type |
|-------|-----------|------|
| `/` | HomePage.tsx | Landing page |
| `/projects` | ProjectsPage.tsx | List all projects |
| `/projects/:id` | ProjectDetailPage.tsx | Single project view |
| `/plots` | PlotsPage.tsx | Available plots |
| `/about` | AboutPage.tsx | Company info |
| `/contact` | ContactPage.tsx | Contact form |
| `/gallery` | GalleryPage.tsx | Photo gallery |

### Admin Pages - Public (1)
| Route | Component | Type |
|-------|-----------|------|
| `/admin/login` | AdminLogin.tsx | Admin authentication |

### Admin Pages - Protected (8)
| Route | Component | Type |
|-------|-----------|------|
| `/admin` | AdminDashboard.tsx | Dashboard overview |
| `/admin/projects` | AdminProjects.tsx | Manage projects |
| `/admin/projects/new` | AdminProjectForm.tsx | Create project |
| `/admin/projects/:id/edit` | AdminProjectForm.tsx | Edit project |
| `/admin/plots` | AdminPlots.tsx | Manage plots |
| `/admin/plots/new` | AdminPlotForm.tsx | Create plot |
| `/admin/plots/:id/edit` | AdminPlotForm.tsx | Edit plot |
| `/admin/inquiries` | AdminInquiries.tsx | View inquiries |
| `/admin/testimonials` | AdminTestimonials.tsx | Manage testimonials |
| `/admin/settings` | AdminSettings.tsx | Site settings |

### Error Page (1)
| Route | Component | Type |
|-------|-----------|------|
| `*` (404) | not-found.tsx | Not found page |

## Test Approach

1. **Build Check** - Run `npm run build` to catch compile errors
2. **Dev Server Check** - Start dev server and check console for errors
3. **Page Route Test** - Create automated test to visit each route
4. **Visual/Functional Check** - Verify key elements render without errors

## Implementation

Create `test-frontend.js` that:
- Starts a headless browser (Playwright)
- Visits each public route
- Checks for console errors
- Takes screenshots (optional)
- Reports pass/fail

## Questions for User

1. Do you want screenshots of each page?
2. Should I test admin pages with login flow?
3. Just build check or full browser testing?
