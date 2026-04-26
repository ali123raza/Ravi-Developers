# Full CMS System Plan for Ravi Developers

Build a comprehensive visual CMS where admin can edit all public pages, sections, and content dynamically with no hardcoded data.

## Current State Analysis

**Already Dynamic:**
- Hero section content (badge, title, subtitle, location, CTA buttons, hero image)
- Contact info (address, phone, email, hours)
- Social links (Facebook, Instagram)
- About content (story, mission, vision, about images)
- Company stats (projects, sqft developed, families, approvals)
- Footer tagline
- Projects (full CRUD via admin)
- Plots (full CRUD via admin)
- Testimonials (full CRUD via admin)

**Still Hardcoded (Need CMS):**
- About page hero title/subtitle
- Contact page layout text
- Gallery page text
- Section headings throughout
- Button labels
- Meta descriptions/titles
- Theme colors (currently hardcoded red/black)

## Proposed CMS Architecture

### 1. Database Schema Updates

**New Tables:**
```sql
-- Page sections management
CREATE TABLE page_sections (
  id VARCHAR(36) PRIMARY KEY,
  page VARCHAR(50) NOT NULL, -- 'home', 'about', 'contact', 'gallery'
  section_key VARCHAR(100) NOT NULL, -- 'hero', 'features', 'cta'
  title VARCHAR(255),
  subtitle VARCHAR(500),
  content JSON,
  images JSON,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Theme settings
CREATE TABLE theme_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  primary_color VARCHAR(20) DEFAULT '#dc2626',
  secondary_color VARCHAR(20) DEFAULT '#111827',
  accent_color VARCHAR(20) DEFAULT '#dc2626',
  font_family VARCHAR(50) DEFAULT 'Inter',
  logo_url VARCHAR(500),
  favicon_url VARCHAR(500),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Navigation/menu management
CREATE TABLE navigation (
  id VARCHAR(36) PRIMARY KEY,
  label VARCHAR(100) NOT NULL,
  href VARCHAR(200) NOT NULL,
  parent_id VARCHAR(36) NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- SEO settings per page
CREATE TABLE seo_settings (
  id VARCHAR(36) PRIMARY KEY,
  page VARCHAR(50) NOT NULL UNIQUE,
  meta_title VARCHAR(100),
  meta_description VARCHAR(500),
  meta_keywords VARCHAR(500),
  og_image VARCHAR(500)
);
```

### 2. Backend API Updates

**New Routes in `api/routes/`:**
- `sections.js` - CRUD for page sections
- `theme.js` - Theme settings management
- `navigation.js` - Menu/navigation management
- `seo.js` - SEO settings management

### 3. Frontend Hooks

**New Files in `src/hooks/`:**
- `useSections.ts` - Fetch and manage page sections
- `useTheme.ts` - Fetch theme settings
- `useNavigation.ts` - Fetch navigation menu
- `useSEO.ts` - Fetch and set SEO meta tags

### 4. Admin Panel CMS Pages

**Visual CMS Interface (`src/views/admin/`):**

**New: `AdminCMS.tsx`** - Main CMS dashboard
- Visual preview of all pages
- Section editor with live preview
- Drag-and-drop section ordering
- Image upload with crop/resize

**New: `AdminTheme.tsx`** - Theme manager
- Color picker for primary/secondary/accent colors
- Font family selector
- Logo & favicon upload
- Live theme preview

**New: `AdminNavigation.tsx`** - Menu editor
- Drag-and-drop menu builder
- Add/edit/delete menu items
- Submenu management

**Enhanced: `AdminSettings.tsx`** - Full page content editor
- Tabbed interface per page (Home, About, Contact, Gallery)
- Rich text editor for content
- Image gallery management
- Form builder for Contact page

### 5. Frontend Updates

**Dynamic Page Rendering:**
- All pages fetch sections from API
- Render sections based on `display_order`
- Apply theme colors from settings
- Dynamic navigation from database
- Auto-set SEO meta tags

**New Components:**
- `DynamicSection.tsx` - Renders any section type
- `ThemeProvider.tsx` - Applies theme colors globally
- `MetaTags.tsx` - Sets SEO meta tags

## Implementation Phases

### Phase 1: Database & Backend (Day 1-2)
1. Create new tables (sections, theme, navigation, seo)
2. Build API routes for CRUD operations
3. Seed default data for all pages
4. Test all endpoints

### Phase 2: Admin Panel CMS (Day 3-4)
1. Build AdminCMS.tsx with visual editor
2. Build AdminTheme.tsx with color pickers
3. Build AdminNavigation.tsx with drag-drop
4. Enhance AdminSettings.tsx

### Phase 3: Frontend Dynamic (Day 5-6)
1. Create useSections, useTheme, useNavigation hooks
2. Update all pages to use dynamic sections
3. Remove all hardcoded text
4. Implement theme provider

### Phase 4: Testing & Polish (Day 7)
1. Full CMS workflow testing
2. Theme switching tests
3. Content update live preview
4. Bug fixes

## Key Features

### Visual Editor
- WYSIWYG editing with live preview
- Rich text editor (bold, italic, links, lists)
- Image upload with drag-drop
- Section visibility toggle
- Reorder sections with drag-drop

### Theme Manager
- Primary color picker
- Secondary color picker
- Accent color picker
- Font family dropdown
- Logo upload with preview
- Live theme preview

### Page Sections
Each page has configurable sections:
- **Home:** Hero, Stats, Featured Projects, Testimonials, CTA
- **About:** Hero, Story, Mission/Vision, Team, Stats
- **Contact:** Hero, Contact Form, Map, Info Cards
- **Gallery:** Hero, Project Filters, Image Grid

### Navigation Manager
- Add new menu items
- Edit labels and URLs
- Create dropdown menus
- Reorder with drag-drop
- Show/hide items

## Important Notes

### UI Design Preservation (✅ CONFIRMED)
- **Current UI layout and design will remain EXACTLY the same**
- Only content will become editable through CMS
- All styling, colors, spacing, animations preserved
- No visual changes to frontend - only backend CMS functionality added

## Decisions Made

| Feature | Choice |
|---------|--------|
| Rich Text Editor | **React-Quill** |
| Image Storage | **Local storage** (current system) |
| Theme Colors | **Full theme** (10+ color options) |
| Drag-Drop Library | **@dnd-kit** (modern, lightweight) |
| UI Changes | **NONE** - Keep current design exactly |

## Implementation Ready - 4 Phases

**Phase 1:** Database + Backend API (2 days)  
**Phase 2:** Admin Panel CMS Pages (2 days)  
**Phase 3:** Frontend Dynamic Integration (2 days)  
**Phase 4:** Testing & Polish (1 day)  

**Total: 7 days** - Start now?
