# Restaurant Management System Design Guidelines

## Design Approach
**Selected Approach:** Design System (Material Design-inspired)
**Justification:** This is a utility-focused, information-dense application where efficiency and learnability are paramount. The dashboard, inventory, analytics, and operational features require clear data presentation and intuitive navigation.

## Core Design Elements

### A. Color Palette
**Primary Colors:**
- Light Mode: 219 84% 25% (Deep Blue)
- Dark Mode: 219 60% 90% (Light Blue)

**Background Colors:**
- Light Mode: 210 20% 98% (Warm White)
- Dark Mode: 222 24% 8% (Dark Navy)

**Accent Colors:**
- Success: 142 76% 36% (Green for positive metrics)
- Warning: 38 92% 50% (Amber for alerts)
- Error: 0 84% 60% (Red for critical issues)

**Surface Colors:**
- Light Mode Cards: 0 0% 100% (Pure White)
- Dark Mode Cards: 220 13% 12% (Dark Gray)

### B. Typography
**Primary Font:** Inter (Google Fonts)
- Headers: 600-700 weight
- Body: 400-500 weight
- Data/Numbers: 500-600 weight (for clarity in tables)

**Secondary Font:** JetBrains Mono (for data tables and metrics)

### C. Layout System
**Spacing Units:** Consistent use of Tailwind units 2, 4, 6, 8, 12, 16
- Component padding: p-4, p-6
- Section margins: m-8, m-12
- Element spacing: gap-4, gap-6
- Card spacing: p-6, m-4

### D. Component Library

**Navigation:**
- Sidebar navigation with collapsible sections
- Top header with user profile and notifications
- Breadcrumb navigation for deep features

**Dashboard Cards:**
- Clean metric cards with large numbers
- Status indicators with color coding
- Quick action buttons with subtle shadows

**Data Tables:**
- Zebra striping for row clarity
- Sortable headers with clear indicators
- Compact row spacing for data density
- Search and filter controls

**Forms:**
- Grouped form sections with clear labels
- Inline validation with real-time feedback
- Primary/secondary button hierarchy
- Input groups for related fields

**Charts & Analytics:**
- Minimal chart styling with clear data points
- Consistent color usage across all visualizations
- Hover states for interactive elements
- Legend placement that doesn't obstruct data

### E. Key Interface Patterns

**Dashboard Layout:**
- Grid-based metric cards (3-4 columns on desktop)
- Priority information above the fold
- Quick navigation tiles for main functions

**Inventory Management:**
- List/grid toggle views
- Bulk action capabilities
- Stock level indicators with color coding
- Search and category filtering

**Analytics Screens:**
- Date range selectors prominently placed
- Export functionality easily accessible
- Comparison views (actual vs target)
- Drill-down capabilities for detailed views

**Mobile Responsiveness:**
- Single column layout on mobile
- Swipe gestures for table navigation
- Collapsed sidebar with hamburger menu
- Touch-friendly button sizing (minimum 44px)

### F. Visual Hierarchy
- Large, bold numbers for key metrics
- Clear section dividers using subtle borders
- Consistent card elevations (shadow-sm for most cards)
- Strategic use of whitespace to group related elements

### G. Interaction States
- Subtle hover effects on interactive elements
- Loading states with skeleton screens
- Clear disabled states for unavailable actions
- Success/error feedback with temporary notifications

This design system prioritizes data clarity, operational efficiency, and professional aesthetics suitable for restaurant management workflows while maintaining consistency across all application modules.