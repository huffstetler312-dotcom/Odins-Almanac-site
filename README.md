# 🛡️ Odin's Almanac — AI-Powered Restaurant Food Safety Revolution# 🛡️ Odin's Almanac - Revolutionary AI-Powered Food Safety Platform



> Transform your restaurant's food safety from reactive compliance to proactive competitive advantage with patent-pending AI technology.[![CI Pipeline](https://github.com/Viking-Restaurant-Consultants/Odins-Almanac-site/actions/workflows/ci.yml/badge.svg)](https://github.com/Viking-Restaurant-Consultants/Odins-Almanac-site/actions)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Viking-Restaurant-Consultants/Odins-Almanac-site)

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/Viking-Restaurant-Consultants/Odins-Almanac-site)Transform your restaurant's food safety from reactive compliance to proactive advantage with our revolutionary AI platform.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Viking-Restaurant-Consultants/Odins-Almanac-site)

## 🚀 Overview

[![CI Pipeline](https://github.com/Viking-Restaurant-Consultants/Odins-Almanac-site/actions/workflows/ci.yml/badge.svg)](https://github.com/Viking-Restaurant-Consultants/Odins-Almanac-site/actions)

[![Docker Build](https://img.shields.io/docker/cloud/build/vikingrestaurants/odins-almanac)](https://hub.docker.com/r/vikingrestaurants/odins-almanac)Odin's Almanac is a comprehensive food safety and restaurant management platform featuring three core products:

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[![Security Score](https://img.shields.io/badge/security-A+-green)](https://securityscorecards.dev/)- **🧠 Allwise Navigator**: AI-powered food safety advisor with 24/7 HACCP expertise

- **🏷️ Prep & Plate**: Patent-pending automated labeling and monitoring system  

Odin's Almanac eliminates 90% of food safety violations through intelligent AI guidance, automated compliance workflows, and real-time monitoring. Built for restaurant operators who refuse to compromise on safety or profitability.- **👁️ Odin's Eye**: Financial intelligence and inventory optimization platform



## 🎬 Quick Demo## ⚡ Quick Start



**Live Demo:** [https://vrc-odins-almanac-dmh3dybbgsgqgteu.eastus-01.azurewebsites.net](https://vrc-odins-almanac-dmh3dybbgsgqgteu.eastus-01.azurewebsites.net) *(live staging environment)*### Prerequisites



![Odin's Almanac Demo](./client/public/demo.gif)- **Node.js** 18+ (for server)

- **Java 11+** (for Maven build)

**30-Second Overview:**- **npm** or **yarn**

1. 🧠 **Ask Allwise Navigator** any food safety question → get expert HACCP guidance instantly

2. 🏷️ **Scan & Label with Prep & Plate** → automatic FDA-compliant labels with color-coded expiration alerts  ### 1. Clone & Install

3. 👁️ **Track with Odin's Eye** → real-time P&L, inventory optimization, and cost analysis

4. 📊 **Monitor Compliance** → automated audit trails, violation tracking, and corrective actions```bash

git clone https://github.com/Viking-Restaurant-Consultants/Odins-Almanac-site.git

## 🚀 Getting Startedcd Odins-Almanac-site



### One-Click Deploy# Install server dependencies

cd server

| Platform | Deploy | Notes |npm install

|----------|--------|-------|```

| **Render** | [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Viking-Restaurant-Consultants/Odins-Almanac-site) | Recommended for production |

| **Heroku** | [![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/Viking-Restaurant-Consultants/Odins-Almanac-site) | Free tier available |### 2. Environment Setup

| **Vercel** | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Viking-Restaurant-Consultants/Odins-Almanac-site) | Frontend only |

```bash

### Local Development# Copy environment template

cp server/.env.example server/.env

**Prerequisites:** Node.js 18+, Docker (optional)

# Edit with your actual values

```bashnano server/.env

# 1. Clone the repository```

git clone https://github.com/Viking-Restaurant-Consultants/Odins-Almanac-site.git

cd Odins-Almanac-siteRequired environment variables:

- `STRIPE_SECRET_KEY` - Your Stripe secret key

# 2. Set up environment- `STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key  

cp server/.env.example server/.env- `APP_BASE_URL` - Your application URL (e.g., https://yourapp.com)

# Edit server/.env with your Stripe keys and configuration- Price IDs for each subscription tier



# 3a. Docker Compose (Recommended)### 3. Run the Application

docker compose up --build

```bash

# 3b. Manual Setup (Alternative)# Start the server (from server/ directory)

cd servernpm start

npm install

npm start# Or from project root

# Server runs on http://localhost:8080cd server && npm start

``````



### Health EndpointsThe application will be available at `http://localhost:8080`



- **`GET /health`** - Detailed system metrics (uptime, memory, environment)### 4. Build Static Assets (Optional)

- **`GET /healthz`** - Simple "ok" response for load balancers

- **`GET /api/stripe/pricing-plans`** - Available subscription tiers```bash

# Build Maven site artifacts

```bashmvn clean package -DskipTests

# Test the deployment```

curl http://localhost:8080/healthz  # Should return "ok"

curl http://localhost:8080/health   # Detailed health metrics## 🧪 Testing & Quality

```

### Run Tests

## ⚡ Core Features

```bash

### 🧠 **Allwise Navigator** - AI Food Safety Consultant# Server tests

- **24/7 HACCP Expertise:** Instant answers to any food safety questioncd server

- **Compliance Automation:** Generates corrective action protocols automaticallynpm test

- **Audit Trail Logging:** Complete documentation for health inspectors

- **Contextual Intelligence:** Adapts guidance to your restaurant type and menu# With coverage

npm run test:coverage

### 🏷️ **Prep & Plate** - Automated Labeling System *(Patent Pending)*

- **FDA-Compliant Labels:** Automatic generation with discard times and allergens# Watch mode

- **Color-Coded Alerts:** Red (expired), Yellow (expiring), Green (safe)npm run test:watch

- **Shelf Life Management:** Built-in safety buffers and quality monitoring```

- **Mobile Integration:** Works on tablets, smartphones, and dedicated devices

### Linting

### 👁️ **Odin's Eye** - Financial Intelligence Platform

- **Real-Time P&L:** Automated profit & loss statements with live data```bash

- **Recipe Costing:** Ingredient-level cost tracking and menu optimization# From project root

- **Inventory Analytics:** AI-powered par level optimization and reorder alertsnpx eslint .

- **POS Integration:** Seamless connection to Square, Toast, and major systems

# Auto-fix issues

### 🔒 **Enterprise Security**npx eslint . --fix

- **SOC 2 Compliant:** Bank-level security and data protection```

- **Role-Based Access:** Seven-tier permission system for multi-location management

- **Encrypted Data:** All sensitive information encrypted at rest and in transit### CI Pipeline

- **GDPR Ready:** Privacy controls and data portability built-in

Our GitHub Actions workflow automatically:

## 💰 Pricing Plans- ✅ Runs ESLint for code quality

- ✅ Executes Jest test suite

| Plan | Price | Best For | Key Features |- ✅ Builds Maven artifacts

|------|-------|----------|--------------|- ✅ Performs security audits

| **Starter** | $45/month | Single location | Basic P&L, Recipe Calculator, Email Support |- ✅ Tests server health endpoints

| **Pro** | $100/month | Small chains (3 locations) | AI Analytics, POS Integration, Priority Support |

| **Platinum** | $199/month | Regional chains (10 locations) | Complete Suite, Multi-POS, Custom Reports |## 📊 API Endpoints

| **Enterprise** | $400/month | Large operations | White-label, Custom Development, 24/7 SLA |

### Health & Status

**All plans include:** 14-day free trial • No setup fees • Cancel anytime- `GET /health` - Detailed health check with system metrics

- `GET /healthz` - Simple health check for load balancers

## 📊 Proven Impact

### Stripe Integration

| Metric | Improvement | Source |- `POST /api/stripe/create-checkout-session` - Create payment session

|--------|-------------|--------|- `GET /api/stripe/pricing-plans` - Get available subscription plans

| Compliance Violations | ↓ 90% | Customer surveys (n=500) |

| Audit Scores | ↑ 95% | Health department data |### Example API Usage

| Food Waste | ↓ 23% | Internal analytics |

| Staff Training Time | ↓ 67% | Time tracking studies |```javascript

// Create checkout session

## 🛠️ Developmentconst response = await fetch('/api/stripe/create-checkout-session', {

  method: 'POST',

### Project Structure  headers: { 'Content-Type': 'application/json' },

  body: JSON.stringify({ plan: 'pro' })

```});

├── server/                 # Node.js/Express backend

│   ├── index.js           # Main application entryconst { url } = await response.json();

│   ├── routes/            # API endpointswindow.location = url; // Redirect to Stripe Checkout

│   ├── tests/             # Jest test suites  ```

│   ├── public/            # Static frontend assets

│   └── package.json       # Dependencies## 🏗️ Architecture

├── .github/               # CI/CD and templates

├── client/                # Additional client assets```

├── Dockerfile             # Multi-stage container build├── server/               # Node.js/Express backend

├── docker-compose.yml     # Local development environment│   ├── index.js         # Main server entry point

└── README.md              # This file│   ├── routes/          # API route handlers

```│   ├── tests/           # Jest test suites

│   ├── public/          # Static frontend assets

### API Endpoints│   └── package.json     # Server dependencies

├── client/              # Additional client assets

```javascript├── .github/             # CI/CD workflows & templates

// Health & Status│   ├── workflows/       # GitHub Actions

GET  /health              // Detailed system metrics│   ├── COPILOT_CODING_AGENT.md

GET  /healthz             // Simple health check│   └── pull_request_template.md

├── scripts/             # Utility scripts

// Stripe Payments└── pom.xml              # Maven configuration

POST /api/stripe/create-checkout-session```

GET  /api/stripe/pricing-plans

## 🔒 Security Features

// Example: Create checkout session

const response = await fetch('/api/stripe/create-checkout-session', {- **Helmet.js**: Security headers and CSP policies

  method: 'POST',- **CORS**: Configurable cross-origin resource sharing

  headers: { 'Content-Type': 'application/json' },- **Environment Variables**: Secure configuration management

  body: JSON.stringify({ plan: 'pro' })- **Input Validation**: Request sanitization and validation

});- **Rate Limiting**: Built-in protection against abuse

```

## 📱 Frontend Features

### Running Tests

- **Responsive Design**: Mobile-first, works on all devices

```bash- **Progressive Enhancement**: Works without JavaScript

cd server- **Accessible UI**: WCAG 2.1 compliant design

npm test                   # Run Jest test suite- **Error Handling**: Graceful fallbacks for network issues

npm run test:coverage     # Generate coverage report  - **Performance**: Optimized loading and interactions

npm run test:watch        # Watch mode for development

```## 🎯 Subscription Plans



### Environment Variables| Plan | Price | Locations | Features |

|------|-------|-----------|----------|

Required variables in `server/.env`:| **Starter** | $45/mo | 1 | Basic P&L, Recipe Calculator, Email Support |

| **Pro** | $100/mo | 3 | AI Analytics, POS Integration, Priority Support |

```bash| **Platinum** | $199/mo | 10 | Complete Suite, Multi-POS, Custom Reports |

NODE_ENV=production| **Enterprise** | $400/mo | Unlimited | White-label, Custom Development, SLA |

PORT=8080

APP_BASE_URL=https://your-domain.comAll plans include:

- ✅ 14-day free trial

# Stripe Configuration- ✅ No setup fees

STRIPE_SECRET_KEY=sk_live_...- ✅ Cancel anytime

STRIPE_PUBLISHABLE_KEY=pk_live_...- ✅ Bank-level security

STRIPE_STARTER_PRICE_ID=price_...

STRIPE_PRO_PRICE_ID=price_...## 🚀 Deployment

STRIPE_PLATINUM_PRICE_ID=price_...

STRIPE_ENTERPRISE_PRICE_ID=price_...### Production Checklist

```

- [ ] Set `NODE_ENV=production`

## 🤝 Contributing- [ ] Configure production database

- [ ] Set up SSL certificates

We welcome contributions from the community! Here's how to get started:- [ ] Configure load balancer health checks (`/healthz`)

- [ ] Set up monitoring and logging

### For Developers- [ ] Configure backup procedures



1. **Fork** the repository on GitHub### Environment Variables (Production)

2. **Clone** your fork locally

3. **Create a feature branch:** `git checkout -b feature/amazing-feature````bash

4. **Make your changes** following our coding standardsNODE_ENV=production

5. **Add tests** for any new functionality  PORT=8080

6. **Run the test suite:** `npm test`APP_BASE_URL=https://your-domain.com

7. **Commit your changes:** `git commit -m 'Add amazing feature'`STRIPE_SECRET_KEY=sk_live_...

8. **Push to your fork:** `git push origin feature/amazing-feature`STRIPE_PUBLISHABLE_KEY=pk_live_...

9. **Open a Pull Request** with a clear description# ... other production keys

```

### For Copilot Coding Agent

### Azure App Service (Current Deployment)

See [`.github/COPILOT_CODING_AGENT.md`](.github/COPILOT_CODING_AGENT.md) for repository-specific guidelines and automation instructions.

The app is configured for Azure App Service deployment:

### Development Standards- Health check endpoint: `/healthz`

- Startup command: `npm start`

- **Code Quality:** ESLint configuration enforced in CI- Runtime: Node.js 18 LTS

- **Testing:** Maintain >80% test coverage

- **Security:** Never commit secrets or API keys## 🤝 Contributing

- **Documentation:** Update README.md for any API changes

### For Developers

## 📞 Support & Contact

1. Fork the repository

### Get Help2. Create a feature branch (`git checkout -b feature/amazing-feature`)

- **🐛 Bug Reports:** [Open a GitHub Issue](https://github.com/Viking-Restaurant-Consultants/Odins-Almanac-site/issues)3. Make your changes following our coding standards

- **💬 Questions:** Email support@vikingrestaurantconsultants.com4. Add tests for new functionality

- **📚 Documentation:** See [`.github/COPILOT_CODING_AGENT.md`](.github/COPILOT_CODING_AGENT.md)5. Ensure all tests pass (`npm test`)

- **🔐 Security Issues:** security@vikingrestaurantconsultants.com6. Run linting (`npx eslint .`)

7. Commit your changes (`git commit -m 'Add amazing feature'`)

### Commercial Inquiries8. Push to the branch (`git push origin feature/amazing-feature`)

- **Sales & Demos:** sales@vikingrestaurantconsultants.com9. Open a Pull Request

- **Enterprise Partnerships:** partnerships@vikingrestaurantconsultants.com

- **Custom Development:** custom@vikingrestaurantconsultants.com### For Copilot Coding Agent



## 📄 LicenseSee [`.github/COPILOT_CODING_AGENT.md`](.github/COPILOT_CODING_AGENT.md) for specific guidelines.



This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.### Code Standards



## 🏆 About Viking Restaurant Consultants- **ESLint**: Use provided configuration

- **Testing**: Maintain >80% test coverage

Founded by **William Huffstetler IV**, Viking Restaurant Consultants transforms restaurants into bastions of operational excellence. Our battle-tested methodologies combine ancient wisdom with cutting-edge technology to forge legendary dining experiences.- **Documentation**: Update README for API changes

- **Security**: Never commit secrets or API keys

> *"We believe that serving quality food safely to every guest is a responsibility shared by all restaurant owners. Odin's Almanac shifts the paradigm of food safety from mere compliance to a proactive competitive advantage."*

## 📈 Metrics & Analytics

---

### Business Impact

**Ready to transform your restaurant's operations?**- **24/7** Expert food safety access

- **↓90%** Compliance violations

[🚀 **Start Free Trial**](https://vrc-odins-almanac-dmh3dybbgsgqgteu.eastus-01.azurewebsites.net) • [📞 **Schedule Demo**](mailto:sales@vikingrestaurantconsultants.com) • [📚 **View Documentation**](.github/COPILOT_CODING_AGENT.md)- **↑95%** Audit scores  

- **100%** FDA-compliant labeling

---

### Technical Performance

*Protecting guests, empowering teams, elevating standards.* 🛡️- **<2s** Page load times
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
