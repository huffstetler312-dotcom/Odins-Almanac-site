# 🚀 Deployment Guide for Odin's Almanac

This guide provides detailed instructions for deploying Odin's Almanac to various platforms.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Platform-Specific Deployments](#platform-specific-deployments)
  - [Heroku](#heroku)
  - [Render](#render)
  - [Vercel](#vercel)
  - [Azure App Service](#azure-app-service)
- [Health Checks](#health-checks)
- [Monitoring & Logging](#monitoring--logging)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

1. **Stripe Account**: Create products and get API keys from [Stripe Dashboard](https://dashboard.stripe.com)
2. **Git Repository**: Fork or clone this repository
3. **Domain Name** (optional): For production deployments
4. **SSL Certificate** (optional): For HTTPS (many platforms provide this automatically)

## Environment Variables

All deployments require these environment variables:

```bash
# Required
NODE_ENV=production                          # Set to 'production' for live deployments
PORT=8080                                    # Server port (auto-set by some platforms)
APP_BASE_URL=https://your-domain.com         # Your application URL

# Stripe Configuration (get from https://dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_live_...                # Live secret key for production
STRIPE_PUBLISHABLE_KEY=pk_live_...           # Live publishable key
STRIPE_STARTER_PRICE_ID=price_...            # Price ID for Starter plan
STRIPE_PRO_PRICE_ID=price_...                # Price ID for Pro plan
STRIPE_PLATINUM_PRICE_ID=price_...           # Price ID for Platinum plan
STRIPE_ENTERPRISE_PRICE_ID=price_...         # Price ID for Enterprise plan
```

### Setting Up Stripe

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create products for each plan (Starter, Pro, Platinum, Enterprise)
3. Set pricing for each product
4. Copy the Price IDs (format: `price_xxxxxxxxxxxxx`)
5. Get your API keys from the Developers section

## Docker Deployment

### Local Development with Docker Compose

1. Clone the repository:
```bash
git clone https://github.com/Viking-Restaurant-Consultants/Odins-Almanac-site.git
cd Odins-Almanac-site
```

2. Create environment files:
```bash
cp .env.example .env
cp server/.env.example server/.env
```

3. Edit both `.env` files with your Stripe credentials

4. Start the application:
```bash
docker-compose up -d
```

5. Access the application:
```
http://localhost:8080
```

6. View logs:
```bash
docker-compose logs -f
```

7. Stop the application:
```bash
docker-compose down
```

### Production Docker Deployment

1. Build the Docker image:
```bash
docker build -t odins-almanac:latest .
```

2. Run the container:
```bash
docker run -d \
  --name odins-almanac \
  -p 8080:8080 \
  -e NODE_ENV=production \
  -e APP_BASE_URL=https://your-domain.com \
  -e STRIPE_SECRET_KEY=sk_live_... \
  -e STRIPE_PUBLISHABLE_KEY=pk_live_... \
  -e STRIPE_STARTER_PRICE_ID=price_... \
  -e STRIPE_PRO_PRICE_ID=price_... \
  -e STRIPE_PLATINUM_PRICE_ID=price_... \
  -e STRIPE_ENTERPRISE_PRICE_ID=price_... \
  --restart unless-stopped \
  odins-almanac:latest
```

3. Health check:
```bash
curl http://localhost:8080/healthz
```

### Docker Registry Deployment

1. Tag your image:
```bash
docker tag odins-almanac:latest your-registry.com/odins-almanac:latest
```

2. Push to registry:
```bash
docker push your-registry.com/odins-almanac:latest
```

3. Pull and run on production server:
```bash
docker pull your-registry.com/odins-almanac:latest
docker run -d --name odins-almanac -p 8080:8080 --env-file .env your-registry.com/odins-almanac:latest
```

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (v1.20+)
- kubectl configured
- cert-manager installed (for TLS)
- nginx-ingress-controller installed

### Deployment Steps

1. Update `k8s-deployment.yml` with your configuration:
   - Replace `your-registry/odins-almanac:latest` with your image
   - Replace `your-domain.com` with your actual domain
   - Update environment variables in ConfigMap and Secret

2. Create namespace and deploy:
```bash
kubectl apply -f k8s-deployment.yml
```

3. Verify deployment:
```bash
# Check pods
kubectl get pods -n odins-almanac

# Check services
kubectl get services -n odins-almanac

# Check ingress
kubectl get ingress -n odins-almanac
```

4. View logs:
```bash
kubectl logs -f deployment/odins-almanac-server -n odins-almanac
```

5. Scale deployment:
```bash
kubectl scale deployment odins-almanac-server --replicas=5 -n odins-almanac
```

### Updating the Deployment

```bash
# Update image
kubectl set image deployment/odins-almanac-server server=your-registry/odins-almanac:v2 -n odins-almanac

# Rollback if needed
kubectl rollout undo deployment/odins-almanac-server -n odins-almanac

# Check rollout status
kubectl rollout status deployment/odins-almanac-server -n odins-almanac
```

## Platform-Specific Deployments

### Heroku

#### One-Click Deploy
1. Click: [![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/Viking-Restaurant-Consultants/Odins-Almanac-site)
2. Fill in the environment variables
3. Click "Deploy app"

#### CLI Deployment
```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set STRIPE_SECRET_KEY=sk_live_...
heroku config:set STRIPE_PUBLISHABLE_KEY=pk_live_...
heroku config:set STRIPE_STARTER_PRICE_ID=price_...
heroku config:set STRIPE_PRO_PRICE_ID=price_...
heroku config:set STRIPE_PLATINUM_PRICE_ID=price_...
heroku config:set STRIPE_ENTERPRISE_PRICE_ID=price_...

# Deploy
git push heroku main

# Open app
heroku open

# View logs
heroku logs --tail
```

### Render

#### One-Click Deploy
1. Click: [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Viking-Restaurant-Consultants/Odins-Almanac-site)
2. Connect your GitHub account
3. Configure environment variables
4. Click "Apply"

#### Manual Setup
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Health Check Path**: `/healthz`
4. Add environment variables from the dashboard
5. Deploy

### Vercel

#### One-Click Deploy
1. Click: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Viking-Restaurant-Consultants/Odins-Almanac-site)
2. Import the repository
3. Configure environment variables
4. Deploy

#### CLI Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Set environment variables
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_PUBLISHABLE_KEY production
# ... add other variables
```

### Azure App Service

The application is already configured for Azure App Service.

#### Deployment Steps

1. Create an Azure App Service (Node.js 18 LTS)

2. Configure Application Settings:
   - Add all environment variables
   - Set `NODE_ENV=production`
   - Set startup command: `cd server && npm start`

3. Configure Health Check:
   - Path: `/healthz`
   - Interval: 30 seconds

4. Deploy via Git, GitHub Actions, or Azure CLI:
```bash
# Azure CLI deployment
az webapp up --name your-app-name --resource-group your-rg
```

5. Access your application:
```
https://your-app-name.azurewebsites.net
```

## Health Checks

The application provides two health check endpoints:

### `/healthz` - Simple Health Check
- Returns: `200 OK` with body `"ok"`
- Use for: Load balancers, Kubernetes probes, uptime monitoring
- Fast and lightweight

### `/health` - Detailed Health Check
- Returns: JSON with system metrics
- Includes: uptime, memory usage, environment
- Use for: Monitoring dashboards, diagnostics

### Configuring Health Checks

**Docker:**
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080/healthz', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
```

**Kubernetes:**
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

**Azure App Service:**
- Go to: Monitoring > Health check
- Path: `/healthz`
- Interval: 30 seconds

## Monitoring & Logging

### Recommended Tools

- **Uptime Monitoring**: UptimeRobot, Pingdom, or platform-native
- **Error Tracking**: Sentry, Rollbar, or LogRocket
- **Performance Monitoring**: New Relic, Datadog, or AppDynamics
- **Log Aggregation**: Papertrail, Loggly, or ELK Stack

### Application Logs

The application logs to stdout/stderr, which can be captured by:

**Docker:**
```bash
docker logs -f odins-almanac
```

**Kubernetes:**
```bash
kubectl logs -f deployment/odins-almanac-server -n odins-almanac
```

**Heroku:**
```bash
heroku logs --tail
```

**Render:**
- View in dashboard under "Logs" tab

**Vercel:**
- View in dashboard under "Deployments" > "View Function Logs"

## Troubleshooting

### Common Issues

#### Application won't start
1. Check environment variables are set correctly
2. Verify Stripe keys are valid
3. Check application logs for specific errors
4. Ensure PORT is set correctly (default: 8080)

#### Health check failing
1. Verify `/healthz` endpoint is accessible
2. Check if application is listening on correct port
3. Review firewall rules
4. Check container/pod status

#### Stripe integration not working
1. Verify you're using LIVE keys in production (prefix: `sk_live_`, `pk_live_`)
2. Check that Price IDs are correct and active
3. Test with Stripe test cards first
4. Review Stripe Dashboard for any issues

#### Performance issues
1. Check memory usage (increase if needed)
2. Review application logs for errors
3. Enable horizontal scaling if available
4. Check network connectivity to Stripe API

### Getting Help

- **GitHub Issues**: Report bugs and issues
- **Email**: support@vikingrestaurantconsultants.com
- **Security**: security@vikingrestaurantconsultants.com

## Post-Deployment Checklist

After deploying to production:

- [ ] Verify health check endpoints are working
- [ ] Test all subscription plans
- [ ] Confirm Stripe webhooks are configured (if needed)
- [ ] Set up monitoring and alerting
- [ ] Configure backup procedures
- [ ] Test SSL/TLS certificate
- [ ] Review security headers
- [ ] Test mobile responsiveness
- [ ] Verify CORS settings
- [ ] Set up error tracking
- [ ] Document custom configuration
- [ ] Train team on support procedures

---

**Need assistance with deployment?** Contact Viking Restaurant Consultants at support@vikingrestaurantconsultants.com
