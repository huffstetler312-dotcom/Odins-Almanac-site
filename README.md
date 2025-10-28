# 🛡️ Odin's Almanac - Revolutionary AI-Powered Food Safety Platform

[![CI Pipeline](https://github.com/Viking-Restaurant-Consultants/Odins-Almanac-site/actions/workflows/ci.yml/badge.svg)](https://github.com/Viking-Restaurant-Consultants/Odins-Almanac-site/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Transform your restaurant's food safety from reactive compliance to proactive advantage with our revolutionary AI platform.

## 🚀 Overview

Odin's Almanac is a comprehensive food safety and restaurant management platform featuring three core products:

- **🧠 Allwise Navigator**: AI-powered food safety advisor with 24/7 HACCP expertise
- **🏷️ Prep & Plate**: Patent-pending automated labeling and monitoring system  
- **👁️ Odin's Eye**: Financial intelligence and inventory optimization platform

## ⚡ Quick Start

### Prerequisites

- **Node.js** 18+ (for server)
- **Java 11+** (for Maven build)
- **npm** or **yarn**

### 1. Clone & Install

```bash
git clone https://github.com/Viking-Restaurant-Consultants/Odins-Almanac-site.git
cd Odins-Almanac-site

# Install server dependencies
cd server
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp server/.env.example server/.env

# Edit with your actual values
nano server/.env
```

Required environment variables:
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key  
- `APP_BASE_URL` - Your application URL (e.g., https://yourapp.com)
- Price IDs for each subscription tier

### 3. Run the Application

```bash
# Start the server (from server/ directory)
npm start

# Or from project root
cd server && npm start
```

The application will be available at `http://localhost:8080`

### 4. Build Static Assets (Optional)

```bash
# Build Maven site artifacts
mvn clean package -DskipTests
```

## 🧪 Testing & Quality

### Run Tests

```bash
# Server tests
cd server
npm test

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Linting

```bash
# From project root
npx eslint .

# Auto-fix issues
npx eslint . --fix
```

### CI Pipeline

Our GitHub Actions workflow automatically:
- ✅ Runs ESLint for code quality
- ✅ Executes Jest test suite
- ✅ Builds Maven artifacts
- ✅ Performs security audits
- ✅ Tests server health endpoints

## 📊 API Endpoints

### Health & Status
- `GET /health` - Detailed health check with system metrics
- `GET /healthz` - Simple health check for load balancers

### Stripe Integration
- `POST /api/stripe/create-checkout-session` - Create payment session
- `GET /api/stripe/pricing-plans` - Get available subscription plans

### Example API Usage

```javascript
// Create checkout session
const response = await fetch('/api/stripe/create-checkout-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ plan: 'pro' })
});

const { url } = await response.json();
window.location = url; // Redirect to Stripe Checkout
```

## 🏗️ Architecture

```
├── server/               # Node.js/Express backend
│   ├── index.js         # Main server entry point
│   ├── routes/          # API route handlers
│   ├── tests/           # Jest test suites
│   ├── public/          # Static frontend assets
│   └── package.json     # Server dependencies
├── client/              # Additional client assets
├── .github/             # CI/CD workflows & templates
│   ├── workflows/       # GitHub Actions
│   ├── COPILOT_CODING_AGENT.md
│   └── pull_request_template.md
├── scripts/             # Utility scripts
└── pom.xml              # Maven configuration
```

## 🔒 Security Features

- **Helmet.js**: Security headers and CSP policies
- **CORS**: Configurable cross-origin resource sharing
- **Environment Variables**: Secure configuration management
- **Input Validation**: Request sanitization and validation
- **Rate Limiting**: Built-in protection against abuse

## 📱 Frontend Features

- **Responsive Design**: Mobile-first, works on all devices
- **Progressive Enhancement**: Works without JavaScript
- **Accessible UI**: WCAG 2.1 compliant design
- **Error Handling**: Graceful fallbacks for network issues
- **Performance**: Optimized loading and interactions

## 🎯 Subscription Plans

| Plan | Price | Locations | Features |
|------|-------|-----------|----------|
| **Starter** | $45/mo | 1 | Basic P&L, Recipe Calculator, Email Support |
| **Pro** | $100/mo | 3 | AI Analytics, POS Integration, Priority Support |
| **Platinum** | $199/mo | 10 | Complete Suite, Multi-POS, Custom Reports |
| **Enterprise** | $400/mo | Unlimited | White-label, Custom Development, SLA |

All plans include:
- ✅ 14-day free trial
- ✅ No setup fees
- ✅ Cancel anytime
- ✅ Bank-level security

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production database
- [ ] Set up SSL certificates
- [ ] Configure load balancer health checks (`/healthz`)
- [ ] Set up monitoring and logging
- [ ] Configure backup procedures

### Environment Variables (Production)

```bash
NODE_ENV=production
PORT=8080
APP_BASE_URL=https://your-domain.com
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
# ... other production keys
```

### Azure App Service (Current Deployment)

The app is configured for Azure App Service deployment:
- Health check endpoint: `/healthz`
- Startup command: `npm start`
- Runtime: Node.js 18 LTS

## 🤝 Contributing

### For Developers

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following our coding standards
4. Add tests for new functionality
5. Ensure all tests pass (`npm test`)
6. Run linting (`npx eslint .`)
7. Commit your changes (`git commit -m 'Add amazing feature'`)
8. Push to the branch (`git push origin feature/amazing-feature`)
9. Open a Pull Request

### For Copilot Coding Agent

See [`.github/COPILOT_CODING_AGENT.md`](.github/COPILOT_CODING_AGENT.md) for specific guidelines.

### Code Standards

- **ESLint**: Use provided configuration
- **Testing**: Maintain >80% test coverage
- **Documentation**: Update README for API changes
- **Security**: Never commit secrets or API keys

## 📈 Metrics & Analytics

### Business Impact
- **24/7** Expert food safety access
- **↓90%** Compliance violations
- **↑95%** Audit scores  
- **100%** FDA-compliant labeling

### Technical Performance
- **<2s** Page load times
- **99.9%** Uptime SLA
- **<100ms** API response times
- **Zero** critical security vulnerabilities

## 🆘 Support & Documentation

- **📖 Documentation**: See `.github/COPILOT_CODING_AGENT.md`
- **🐛 Bug Reports**: Open GitHub issues
- **💬 Questions**: Contact Viking Restaurant Consultants
- **🔐 Security Issues**: Email security@vikingrestaurantconsultants.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Built by Viking Restaurant Consultants

> *"Forging legendary dining experiences through the ancient wisdom of strategic excellence. We transform restaurants into bastions of food safety where every detail is crafted for conquest."*

**William Huffstetler IV, Founder**  
Viking Restaurant Consultants

---

**Ready to transform your restaurant's food safety operations?**

[🚀 Start Your Free Trial](https://your-domain.com) • [📞 Contact Sales](mailto:sales@vikingrestaurantconsultants.com) • [📚 Documentation](https://docs.your-domain.com)

---

*Protecting guests, empowering teams, elevating standards.* 🛡️
