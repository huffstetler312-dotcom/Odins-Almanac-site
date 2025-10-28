# 🛡️ Odin's Almanac - Revolutionary AI-Powered Food Safety Platform

[![CI Pipeline](https://github.com/Viking-Restaurant-Consultants/Odins-Almanac-site/actions/workflows/ci.yml/badge.svg)](https://github.com/Viking-Restaurant-Consultants/Odins-Almanac-site/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Deploy to Heroku](https://img.shields.io/badge/deploy%20to-heroku-430098.svg)](https://heroku.com/deploy?template=https://github.com/Viking-Restaurant-Consultants/Odins-Almanac-site)
[![Deploy to Render](https://img.shields.io/badge/deploy%20to-render-46E3B7.svg)](https://render.com/deploy?repo=https://github.com/Viking-Restaurant-Consultants/Odins-Almanac-site)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Viking-Restaurant-Consultants/Odins-Almanac-site)

Transform your restaurant's food safety from reactive compliance to proactive advantage with our revolutionary AI platform.

> **🎥 30-Second Demo:** [Watch the platform in action](https://your-demo-url.com) | **🌐 Live Demo:** [Try it now](https://your-demo-url.com)

## 🚀 Overview

Odin's Almanac is a comprehensive food safety and restaurant management platform featuring three core products:

- **🧠 Allwise Navigator**: AI-powered food safety advisor with 24/7 HACCP expertise
- **🏷️ Prep & Plate**: Patent-pending automated labeling and monitoring system  
- **👁️ Odin's Eye**: Financial intelligence and inventory optimization platform

### Why Odin's Almanac?

- ⚡ **Instant Compliance**: 24/7 AI-powered food safety expert at your fingertips
- 📊 **Smart Analytics**: Real-time financial intelligence and inventory optimization
- 🏷️ **Automated Labeling**: Patent-pending system eliminates manual tracking errors
- 🛡️ **Risk Reduction**: Reduce compliance violations by 90%, improve audit scores by 95%
- 💰 **Cost Savings**: Optimize inventory, reduce waste, and maximize profitability

## ⚡ Quick Start

Choose your preferred deployment method:

### Option 1: One-Click Deploy (Fastest) 🚀

Deploy to your favorite platform in under 2 minutes:

- **Heroku**: [![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/Viking-Restaurant-Consultants/Odins-Almanac-site)
- **Render**: [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Viking-Restaurant-Consultants/Odins-Almanac-site)
- **Vercel**: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Viking-Restaurant-Consultants/Odins-Almanac-site)

### Option 2: Docker (Recommended for Production) 🐳

The application uses Docker Compose to orchestrate three services:
- PostgreSQL 15 database
- Java Spring Boot backend (port 8080)
- React frontend with Nginx (port 3000)

```bash
# Clone the repository
git clone https://github.com/Viking-Restaurant-Consultants/Odins-Almanac-site.git
cd Odins-Almanac-site

# Start all services
docker compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
# Database: localhost:5432

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### Option 3: Local Development 💻

### Prerequisites

- **Node.js** 18+ (for server)
- **Java 11+** (for Maven build, optional)
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

### Health & Status Checks

Health check endpoints are essential for load balancers, orchestration platforms, and monitoring systems.

#### `GET /health`
Detailed health check with comprehensive system metrics.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-10-28T03:00:00.000Z",
  "uptime": 3600.45,
  "memory": {
    "rss": 52428800,
    "heapTotal": 18874368,
    "heapUsed": 10485760,
    "external": 1234567
  },
  "env": "production"
}
```

**Use Cases:**
- Monitoring dashboards
- Detailed system diagnostics
- Performance tracking
- Health status reporting

#### `GET /healthz`
Simple lightweight health check for load balancers and Kubernetes probes.

**Response:**
```
ok
```

**Use Cases:**
- Kubernetes liveness/readiness probes
- Load balancer health checks
- Uptime monitoring
- High-frequency health polling

**Configuration Examples:**

Docker healthcheck:
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080/healthz', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
```

Kubernetes probes:
```yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 30
readinessProbe:
  httpGet:
    path: /healthz
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 10
```

### Stripe Integration

#### `POST /api/stripe/create-checkout-session`
Create a Stripe Checkout session for subscription purchase.

**Request:**
```json
{
  "plan": "pro"
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

**Available Plans:** `starter`, `pro`, `platinum`, `enterprise`

#### `GET /api/stripe/pricing-plans`
Get all available subscription plans with pricing details.

**Response:**
```json
[
  {
    "id": "starter",
    "name": "Starter Plan",
    "price": 45,
    "currency": "USD",
    "interval": "month",
    "features": ["1 Location", "Basic P&L", "Recipe Calculator", "Email Support"]
  },
  // ... more plans
]
```

### Example API Usage

```javascript
// Health Check
const health = await fetch('/health').then(r => r.json());
console.log(`Server uptime: ${health.uptime}s`);

// Create checkout session
const response = await fetch('/api/stripe/create-checkout-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ plan: 'pro' })
});

const { url } = await response.json();
window.location = url; // Redirect to Stripe Checkout

// Get pricing plans
const plans = await fetch('/api/stripe/pricing-plans').then(r => r.json());
console.log(`Available plans: ${plans.length}`);
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
├── Dockerfile           # Docker image definition
├── docker-compose.yml   # Local Docker orchestration
├── k8s-deployment.yml   # Kubernetes manifests
├── render.yaml          # Render.com deployment config
├── vercel.json          # Vercel deployment config
├── app.json             # Heroku deployment config
├── Procfile             # Heroku process definition
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

### Quick Deploy Options

Deploy Odin's Almanac to your favorite platform in minutes:

#### 🔷 Heroku (Fastest for beginners)
```bash
# One-click deploy
```
[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/Viking-Restaurant-Consultants/Odins-Almanac-site)

Or via CLI:
```bash
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set STRIPE_SECRET_KEY=sk_live_...
# ... set other env vars
git push heroku main
```

#### 🟢 Render (Best for production)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Viking-Restaurant-Consultants/Odins-Almanac-site)

Uses `render.yaml` for automatic configuration. Just connect your GitHub repo and set environment variables.

#### ▲ Vercel (Best for serverless)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Viking-Restaurant-Consultants/Odins-Almanac-site)

```bash
# Or via CLI
npm i -g vercel
vercel --prod
```

#### 🐳 Docker Deployment

**Local Development:**
```bash
docker-compose up -d
```

**Production:**
```bash
# Build image
docker build -t odins-almanac:latest .

# Run container
docker run -d \
  -p 8080:8080 \
  -e NODE_ENV=production \
  -e STRIPE_SECRET_KEY=sk_live_... \
  --name odins-almanac \
  odins-almanac:latest
```

**Docker Registry:**
```bash
# Tag and push to your registry
docker tag odins-almanac:latest your-registry/odins-almanac:latest
docker push your-registry/odins-almanac:latest
```

#### ☸️ Kubernetes Deployment

```bash
# Update k8s-deployment.yml with your configuration
kubectl apply -f k8s-deployment.yml

# Check deployment status
kubectl get pods -n odins-almanac
kubectl get services -n odins-almanac

# View logs
kubectl logs -f deployment/odins-almanac-server -n odins-almanac
```

The Kubernetes manifests include:
- Horizontal Pod Autoscaling (2-10 replicas)
- Health checks (liveness & readiness probes)
- Resource limits and requests
- TLS/SSL via cert-manager
- Ingress configuration

### Production Checklist

Before deploying to production:

- [ ] Set `NODE_ENV=production`
- [ ] Use live Stripe keys (`sk_live_...`, `pk_live_...`)
- [ ] Configure production domain in `APP_BASE_URL`
- [ ] Set up SSL/TLS certificates
- [ ] Configure load balancer health checks (`/healthz`)
- [ ] Set up monitoring and logging
- [ ] Configure backup procedures
- [ ] Test payment flows end-to-end
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configure rate limiting if needed
- [ ] Review CORS settings
- [ ] Enable security headers (Helmet.js)

### Environment Variables (Production)

```bash
NODE_ENV=production
PORT=8080
APP_BASE_URL=https://your-domain.com
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_PLATINUM_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
```

### Platform-Specific Notes

#### Azure App Service (Current Deployment)

The app is configured for Azure App Service deployment:
- Health check endpoint: `/healthz`
- Startup command: `cd server && npm start`
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

## 🌐 Live Demos & Resources

### Public Demo
🎯 **Try the live demo:** [https://vrc-odins-almanac-dmh3dybbgsgqgteu.eastus-01.azurewebsites.net](https://vrc-odins-almanac-dmh3dybbgsgqgteu.eastus-01.azurewebsites.net)

Experience the full platform with:
- Interactive pricing page with Stripe integration (test mode)
- Real-time health monitoring at `/health`
- Complete product showcase
- Mobile-responsive design

### Video Demos
- 🎥 **30-Second Overview**: Coming soon - will showcase key features and value proposition
- 📺 **Full Platform Walkthrough**: Coming soon - complete product demonstration
- 🎬 **API Integration Guide**: Coming soon - developer-focused integration tutorial

### Additional Resources
- 📚 **API Documentation**: Check the API Endpoints section above
- 💡 **Integration Examples**: See `server/public/index.html` for Stripe integration
- 🔧 **Setup Guide**: Follow the Quick Start section
- 🏗️ **Architecture Diagrams**: See Architecture section

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Built by Viking Restaurant Consultants

> *"Forging legendary dining experiences through the ancient wisdom of strategic excellence. We transform restaurants into bastions of food safety where every detail is crafted for conquest."*

**William Huffstetler IV, Founder**  
Viking Restaurant Consultants

---

**Ready to transform your restaurant's food safety operations?**

[🚀 Start Your Free Trial](https://vrc-odins-almanac-dmh3dybbgsgqgteu.eastus-01.azurewebsites.net) • [📞 Contact Sales](mailto:sales@vikingrestaurantconsultants.com) • [📚 Documentation](https://docs.your-domain.com)

---

*Protecting guests, empowering teams, elevating standards.* 🛡️
