# Odin's Almanac — AI-Powered Food Safety & Restaurant Intelligence Platform

[![CI Pipeline](https://github.com/Viking-Restaurant-Consultants/Odins-Almanac-site/actions/workflows/ci.yml/badge.svg)](https://github.com/Viking-Restaurant-Consultants/Odins-Almanac-site/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Odin's Almanac transforms restaurant operations from reactive compliance to proactive excellence through AI-powered food safety, automated labeling systems, and financial intelligence. Built for restaurant owners and managers who demand 24/7 HACCP expertise, FDA-compliant automation, and real-time operational insights—all while reducing violations by 90% and achieving 95%+ audit scores.

## Quick demo

- **Live demo**: https://odinsalmanac.azurewebsites.net
- **30s overview**: See `client/public/demo.gif` for a visual walkthrough

![Odin's Almanac Demo](client/public/demo.gif)

## Getting started (developer)

1. **Clone the repository**
   ```bash
   git clone https://github.com/Viking-Restaurant-Consultants/Odins-Almanac-site.git
   cd Odins-Almanac-site
   ```

2. **Copy `.env.example` → `.env` and set secrets**
   ```bash
   cp server/.env.example server/.env
   # Edit server/.env with your Stripe API keys and price IDs
   ```

3. **For local dev (docker-compose)**
   ```bash
   docker compose up --build
   ```
   Application will be available at `http://localhost:8080`

4. **For manual setup**
   - **Backend**:
     ```bash
     cd server
     npm install
     npm start
     ```
   - **Frontend** (if building static assets):
     ```bash
     cd client
     npm install
     npm run build
     npx serve -s build
     ```
   - **Maven build** (optional):
     ```bash
     mvn clean package -DskipTests
     ```

## One-click deploy

- **Frontend**: 
  - [Deploy to Vercel](https://vercel.com/new) — Connect your GitHub repo
  - [Deploy to Netlify](https://app.netlify.com/start) — Drag & drop or Git integration
- **Backend**:
  - [Deploy to Render](https://render.com) — Web Service from Git repository
  - [Deploy to Heroku](https://heroku.com) — `git push heroku main`
  - **AWS ECS Fargate** — Use `server/Dockerfile` with ECS task definitions

**Note**: Set environment variables in your deployment platform matching those in `server/.env.example`

## Features

- 🧠 **Allwise Navigator** — AI-powered food safety advisor with 24/7 HACCP expertise
- 🏷️ **Prep & Plate** — Patent-pending automated labeling and monitoring system
- 👁️ **Odin's Eye** — Financial intelligence and inventory optimization platform
- 💳 **Stripe Integration** — Subscription billing with 4 pricing tiers (Starter, Pro, Platinum, Enterprise)
- 🔒 **Enterprise Security** — Helmet.js, CORS, rate limiting, secure environment configuration
- 📊 **Health Monitoring** — `/health` and `/healthz` endpoints for production readiness
- 🧪 **Full Test Coverage** — Jest test suite with >80% coverage
- 🚀 **CI/CD Pipeline** — Automated testing, linting, and security audits via GitHub Actions
- 📱 **Responsive Design** — Mobile-first, accessible (WCAG 2.1), works on all devices

## Contact / Contributing / License

### How to contribute

We welcome contributions from the community! Here's how to get started:

1. **Fork the repository** and create a feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Make your changes** following our coding standards:
   - Run tests: `npm test`
   - Run linting: `npx eslint . --fix`
   - Maintain >80% test coverage
3. **Submit a pull request** with a clear description of your changes
4. **Review process**: Our team will review your PR and provide feedback

For Copilot Coding Agent instructions, see [`.github/COPILOT_CODING_AGENT.md`](.github/COPILOT_CODING_AGENT.md)

### Contact & Support

- **🐛 Bug Reports**: [Open a GitHub issue](https://github.com/Viking-Restaurant-Consultants/Odins-Almanac-site/issues)
- **💬 Questions**: Contact Viking Restaurant Consultants
- **📧 General Inquiries**: sales@vikingrestaurantconsultants.com
- **🔐 Security Issues**: security@vikingrestaurantconsultants.com

### License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for full details.

**Built by Viking Restaurant Consultants**  
*Forging legendary dining experiences through strategic excellence.*

---

**Ready to transform your restaurant's food safety operations?**  
[🚀 Start Your Free Trial](https://odinsalmanac.azurewebsites.net) • [📞 Contact Sales](mailto:sales@vikingrestaurantconsultants.com)
