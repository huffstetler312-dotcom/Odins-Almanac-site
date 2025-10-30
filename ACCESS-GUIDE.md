# 🏴‍☠️ VIKING RESTAURANT INTELLIGENCE PLATFORM
# Complete Access Guide and Usage Instructions

## 🚀 HOW TO ACCESS THE PLATFORM

### Option 1: Using the Launcher (Recommended)
```bash
# Double-click this file or run in terminal:
start-platform.bat
```

### Option 2: Direct Node.js Command
```bash
# If Node.js is in your PATH:
node server-manager.js

# Or find and run Node.js directly:
"C:\Program Files\nodejs\node.exe" server-manager.js
```

### Option 3: Using npm (if available)
```bash
npm start
```

## 📍 ACCESS URLS (Once Server is Running)

| Service | URL | Description |
|---------|-----|-------------|
| **Main Platform** | http://localhost:3000 | Full restaurant intelligence dashboard |
| **Pricing Page** | http://localhost:3000/pricing.html | Subscription tiers and free trial |
| **Dashboard** | http://localhost:3000/dashboard.html | Analytics and AI insights |
| **Health Check** | http://localhost:3000/health | Server status monitoring |
| **API Endpoints** | http://localhost:3000/api/* | RESTful API access |

## 💰 PRICING STRUCTURE

### 🆓 Free Trial (14 Days)
- All AI features included
- Full platform access
- No credit card required
- Automatic conversion prompts

### 💼 Enterprise Tiers
- **Starter**: $45/month - Small restaurants
- **Pro**: $99/month - Multi-location chains  
- **Platinum**: $299/month - Enterprise franchise operations

## 🛡️ CRASH PROTECTION FEATURES

The platform includes enterprise-grade reliability:
- **Auto-restart on crashes** (up to 10 attempts)
- **Health monitoring** every 30 seconds
- **Exponential backoff** retry logic
- **Graceful shutdown** handling
- **Process monitoring** and logging

## 🧪 TESTING THE PLATFORM

### Patent Feature Testing
```bash
node patent-feature-tests.js
```

### Health Check
```bash
curl http://localhost:3000/health
```

### API Testing
```bash
# Test restaurant analysis
curl -X POST http://localhost:3000/api/analyze-restaurant -H "Content-Type: application/json" -d '{"name":"Test Restaurant","location":"Test City"}'
```

## 🔧 TROUBLESHOOTING

### Node.js Not Found
1. Install Node.js from https://nodejs.org (v18+ recommended)
2. Restart your terminal/command prompt
3. Verify installation: `node --version`

### Port Already in Use
1. Change port in server-manager.js (line with `const PORT`)
2. Or kill existing processes: `taskkill /F /IM node.exe`

### Dependencies Missing
```bash
npm install
```

## 🌐 PRODUCTION DEPLOYMENT

### Azure Deployment (Recommended)
```bash
# Deploy to Azure using our Bicep templates:
.\deploy.ps1
```

### Manual Azure Setup
1. Resource Group: Create or use existing
2. App Service: Deploy server code
3. Cosmos DB: Configure for user data
4. Key Vault: Store sensitive configuration
5. Application Insights: Enable monitoring

## 📊 MONITORING & LOGS

### Local Logs
- Server logs: `logs/server-manager.log`
- Application logs: Console output
- Error logs: `logs/error.log`

### Production Monitoring
- Application Insights integration
- Azure Monitor alerts
- Health endpoint monitoring

## 🎯 KEY FEATURES TO DEMONSTRATE

1. **AI-Powered Restaurant Analysis**
   - Competitive analysis
   - Performance predictions
   - Market insights

2. **Real-time Dashboard**
   - Live analytics
   - Performance metrics
   - Trend analysis

3. **Subscription Management**
   - Stripe integration
   - Trial period handling
   - Tier-based features

4. **Enterprise Security**
   - Role-based access
   - Data encryption
   - Audit logging

## 📱 CUSTOMER DEMO FLOW

1. **Start with Free Trial** → `/pricing.html`
2. **Show Dashboard** → `/dashboard.html`  
3. **Demonstrate AI Features** → Main platform
4. **Highlight Enterprise Value** → Pricing comparison
5. **Close with Production Benefits** → Scalability discussion

## 🔐 SECURITY FEATURES

- Helmet.js security headers
- Rate limiting protection
- CORS configuration
- Input validation
- SQL injection prevention
- XSS protection

---

**Ready to dominate the restaurant intelligence market! 🏴‍☠️**

*Platform Status: ✅ Production Ready | ✅ Enterprise Grade | ✅ Patent Pending Features*