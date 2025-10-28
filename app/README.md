# Odin's Eye Restaurant AI Management System

## 🚀 Quick Start

### Prerequisites
- **Node.js 20.x** (Download from https://nodejs.org/)
- **npm 10.x** (comes with Node.js)

### Installation

1. **Extract the zip file** to your desired location

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env and add your keys (see Configuration section below)
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Access the application:**
   - Open http://localhost:5000 in your browser

## 📁 Project Structure

```
odins-eye/
├── client/               # Frontend React application
│   └── src/
│       ├── pages/       # All application routes
│       ├── components/  # Reusable UI components
│       ├── lib/        # Utilities and helpers
│       └── hooks/      # Custom React hooks
├── server/              # Backend Express server
│   ├── index.ts        # Server entry point
│   ├── routes.ts       # API endpoints
│   ├── storage.ts      # Data layer (in-memory)
│   ├── replitAuth.ts   # Authentication
│   └── services/       # AI algorithms
├── shared/              # Shared types and schemas
│   └── schema.ts       # Database schema
├── attached_assets/     # Static files and mobile app code
│   └── vibecode_extracted/  # React Native mobile app
└── package.json        # Dependencies and scripts
```

## ⚙️ Configuration

### Required Environment Variables

Edit the `.env` file with your actual values:

#### Session Secret (Required)
Generate a random string:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Stripe Keys (Required for payments)
Get from https://dashboard.stripe.com/test/apikeys

1. **Test Mode (Development):**
   - `STRIPE_SECRET_KEY`: Your test secret key (sk_test_...)
   - `VITE_STRIPE_PUBLIC_KEY`: Your test publishable key (pk_test_...)
   - `STRIPE_PRICE_ID`: Create a test product ($199/month subscription)
   - `STRIPE_WEBHOOK_SECRET`: From webhook endpoint settings

2. **Live Mode (Production):**
   - Replace test keys with live keys (sk_live_..., pk_live_...)

#### Database (Optional)
Currently uses in-memory storage. To use PostgreSQL:
1. Install PostgreSQL locally
2. Create a database
3. Update `DATABASE_URL` in .env
4. Modify `server/storage.ts` to use database instead of MemStorage

## 📦 Available Scripts

```bash
npm run dev        # Start development server (port 5000)
npm run build      # Build for production
npm start          # Run production server
npm run check      # TypeScript type checking
npm run db:push    # Push database schema (if using PostgreSQL)
```

## 🌟 Features

### Free Tier
- Real-time Dashboard
- Professional P&L Export (Excel)
- Par Level Management
- POS Integration Setup Guide
- Basic Analytics
- Single Location

### Pro Tier ($199/month)
- Advanced Inventory Management
- AI-Powered Truck Ordering
- Predictive Analytics & Forecasting
- Variance Analysis & Loss Prevention
- Recipe Cost Management
- Target & Goal Tracking
- Multi-Location Support
- Priority Support
- API Access

## 🧪 Testing Payments

### Stripe Test Mode
1. Navigate to `/pricing`
2. Click "Upgrade to Pro"
3. Use test card: `4242 4242 4242 4242`
4. Any future date for expiry
5. Any 3 digits for CVC
6. Any 5 digits for ZIP

## 🚨 Common Issues

### Port Already in Use
```bash
# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Missing Environment Variables
- Ensure `.env` file exists in root directory
- Check all required variables are set
- Restart server after changing `.env`

### Authentication Not Working
- Replit OAuth only works on Replit platform
- App will run in degraded mode locally (no login required)
- Consider implementing alternative auth for local development

## 🎯 Patentable Innovations

This system contains 6 patentable AI algorithms:

1. **PIOE** - Predictive Inventory Optimization Engine
2. **IWPPS** - Intelligent Waste Prediction & Prevention System
3. **IVALPS** - Inventory Variance Analysis & Loss Prevention System
4. **SPLOS/MAPO** - Smart Par Level Optimization System
5. **Multi-POS Sync** - Advanced POS Integration Engine
6. **ISCE** - Inventory-Sales Coupling Engine

## 📱 Mobile App

The React Native mobile app code is included in `attached_assets/vibecode_extracted/`
- Full implementation of all 6 patentable algorithms
- Ready for iOS/Android deployment
- Uses Expo for easy development

## 🚀 Deployment

### Production Checklist
- [ ] Switch `NODE_ENV=production`
- [ ] Use Stripe live keys
- [ ] Create live Stripe Price ID ($199/month)
- [ ] Set up live webhook endpoint
- [ ] Generate new `SESSION_SECRET`
- [ ] Consider using PostgreSQL instead of in-memory storage
- [ ] Run `npm run build` before deployment

## 📞 Support

For questions or issues:
- Check the `/pos-setup-guide` for POS integration help
- Review the `/comprehensive-pl` for P&L export documentation
- Contact support for enterprise pricing

## 📄 License

© 2025 Viking Restaurant Consultants - All Rights Reserved

---

Built with ❤️ for restaurant success