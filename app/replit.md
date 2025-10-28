# Restaurant Management System

## Overview

This is a comprehensive restaurant management system with **patentable AI-powered innovations** for inventory optimization, waste reduction, and loss prevention. The system is designed for **dual-platform deployment**:

1. **Web Application (This Replit Project)**: Browser-based SaaS platform for desktop and tablet use
2. **Mobile Application (VibCode)**: React Native app for iOS and Android App Store distribution

Both platforms share the same **proprietary algorithms and patentable innovations** to ensure comprehensive patent coverage across web and mobile implementations.

## Patent Strategy

This system contains **six major patentable innovations** that are implemented consistently across both web and mobile platforms:

### 1. PIOE - Predictive Inventory Optimization Engine
Multi-dimensional demand prediction combining historical sales, weather data, local events, and cross-item correlations with machine learning.

### 2. SPLOS - Smart Par Level Optimization System  
Automated par level adjustment with confidence-based automation, allowing AI to implement high-confidence recommendations automatically while requiring human approval for uncertain changes.

### 3. Advanced Multi-POS Synchronization Engine
Distributed conflict resolution algorithm for synchronizing inventory across multiple heterogeneous POS systems with intelligent business logic prioritization.

### 4. IWPPS - Intelligent Waste Prediction and Prevention System
Comprehensive waste prediction combining spoilage modeling, demand forecasting, dynamic FIFO rotation, supplier quality correlation, and menu engineering recommendations.

### 5. IVALPS - Inventory Variance Analysis and Loss Prevention System
Real-time theoretical inventory calculation with statistical variance analysis, machine learning loss pattern recognition, theft detection, and automated reporting.

### 6. ISCE - Inventory-Sales Coupling Engine
Real-time waste detection through POS-inventory coupling, automatic anomaly detection, and pattern-based waste trend analysis.

The dual-platform approach ensures maximum market coverage and stronger patent protection by demonstrating the innovations work across different technology stacks.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management and caching
- **UI Framework**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with a comprehensive design system
- **Theme Support**: Light/dark mode support with system preference detection

### Design System
- **Component Library**: Material Design-inspired approach using Shadcn/ui
- **Color System**: ARCC (Adaptive Restaurant Contextual Colorization) for intelligent KPI color mapping
- **Typography**: Inter font family with JetBrains Mono for data display
- **Layout**: Sidebar navigation with collapsible sections and responsive design
- **Accessibility**: WCAG AA compliant color contrasts

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API design with structured error handling
- **Development**: Hot reloading with Vite integration in development mode
- **Build Process**: ESBuild for server compilation

### Data Storage
- **Database**: PostgreSQL using Neon serverless database
- **ORM**: Drizzle ORM for type-safe database operations
- **Migrations**: Drizzle Kit for schema migrations
- **Schema Design**: Comprehensive restaurant management schema including:
  - Users and authentication
  - Inventory items with stock tracking
  - Recipes with ingredient relationships
  - Operational targets and analytics
  - Variance tracking and reporting

### Key Features

#### Core Features (Implemented)
- **Dashboard**: Real-time metrics and KPI visualization with ARCC color indicators
- **Inventory Management**: Stock tracking, low stock alerts, item management
- **Recipe Management**: Recipe creation with ingredient tracking and cost calculation
- **Target Management**: Operational goal setting and tracking
- **Analytics**: Performance metrics and trend analysis
- **POS Integration**: Multi-POS synchronization with conflict resolution
- **ISCE System**: Real-time waste detection and pattern analysis

#### Advanced Patentable Features (In Progress - Aligning with VibCode Mobile)
- **PIOE Engine**: Multi-dimensional predictive inventory optimization
- **IWPPS System**: Intelligent waste prediction and prevention
- **IVALPS System**: Advanced variance analysis with theft detection
- **Smart Par Optimization**: AI-driven par level recommendations
- **P&L Dashboard**: Profit & Loss tracking with variance analysis
- **Menu Engineering**: AI-powered menu optimization based on waste patterns

### Authentication & Security
- Session-based authentication system
- PostgreSQL session store using connect-pg-simple
- Environment-based configuration for database connections

### Development Tools
- **Type Safety**: Full TypeScript coverage across frontend and backend
- **Code Quality**: Shared schema validation using Zod
- **Development Experience**: Replit-optimized with runtime error overlays and development banners
- **Hot Reloading**: Vite HMR for instant development feedback

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Connection**: @neondatabase/serverless for database connectivity

### UI and Styling
- **Radix UI**: Comprehensive primitive components for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Type-safe variant creation for components

### Development and Build Tools
- **Vite**: Fast build tool and development server
- **ESBuild**: Fast JavaScript bundler for production builds
- **TSX**: TypeScript execution for development

### Data Management
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state management with validation
- **Date-fns**: Date manipulation and formatting utilities

### Session and Storage
- **Connect PG Simple**: PostgreSQL session store for Express sessions
- **Drizzle Zod**: Schema validation integration

## Recent Changes

### January 2025 - Feature Alignment Initiative
**Goal**: Align Replit web app with VibCode mobile app to ensure comprehensive patent coverage across both platforms.

**Completed**:
- ✅ Fixed 32 TypeScript errors in server/storage.ts
- ✅ Implemented ISCE (Inventory-Sales Coupling Engine) with real-time triggers
- ✅ Extracted and analyzed VibCode mobile app codebase
- ✅ Documented dual-platform patent strategy
- ✅ **Comprehensive Restaurant P&L System** - Professional Excel export tool with:
  - Multi-period comparisons (Budget vs Actual, Last Year, YTD)
  - Detailed restaurant categories (Revenue, COGS, Labor, Operating Expenses)
  - Industry benchmark targets (Food Cost 28-35%, Labor 25-35%, Prime Cost 60-65%)
  - Excel formulas that recalculate automatically when edited
  - Viking Consulting professional branding and styling
  - Multi-sheet workbooks (P&L Statement, KPI Dashboard, Variance Analysis, YTD Summary)
- ✅ **POS Integration Setup Guide** - Comprehensive documentation with:
  - Step-by-step setup for Square, Toast, Clover, and Lightspeed POS systems
  - API configuration and webhook setup instructions
  - Mobile app deployment guide (iOS & Android via EAS)
  - Web app publishing instructions for Replit
- ✅ **Truck Ordering System** - AI-powered automatic ordering with:
  - Calculates order quantities based on par levels and predicted demand
  - Groups orders by supplier with cost breakdowns
  - Stockout risk assessment and prioritization
  - CSV export functionality
  - Real-time delivery date estimation
- ✅ **Paid Tier System** - Feature monetization framework with:
  - Free tier: Basic features (Dashboard, P&L, Par Levels, POS Setup)
  - Pro tier: Advanced features (Inventory, Analytics, Variance, Recipes, Targets, Truck Ordering)
  - Tier toggle for testing and demonstration
  - Upgrade prompts with feature benefits
- ✅ **Customer Acquisition & Monetization System** - Complete revenue generation toolkit:
  - **Pricing Page**: Professional Free vs Pro comparison with clear ROI messaging ($199/month)
  - **Landing Page**: Marketing-focused with problem/solution framework, social proof, and testimonials
  - **Contact/Demo Form**: Enterprise sales enablement with demo request and volume pricing options
  - **Enhanced CTAs**: Upgrade prompts include both self-service upgrade and contact buttons
  - All pages fully accessible with proper scrolling and SPA navigation

**In Progress**:
- 🔄 Porting PIOE (Predictive Inventory Optimization Engine) from mobile to web
- 🔄 Porting IWPPS (Intelligent Waste Prediction System) from mobile to web  
- 🔄 Enhancing IVALPS (Variance Analysis & Loss Prevention) to match mobile features
- 🔄 Building Smart Par Level Optimizer component

## Platform Comparison

### VibCode Mobile App (React Native)
- Expo-based React Native application
- Zustand for state management with AsyncStorage persistence
- AI integrations: Anthropic, OpenAI, Grok
- Full implementation of all 6 patentable algorithms
- Ready for iOS/Android App Store deployment

### Replit Web App (React + Express)
- Vite-powered React SPA with Express backend
- TanStack Query for server state management
- PostgreSQL database with Drizzle ORM
- Currently implementing all 6 patentable algorithms to match mobile
- Deployment as browser-based SaaS platform

Both platforms will have feature parity to ensure comprehensive patent protection.