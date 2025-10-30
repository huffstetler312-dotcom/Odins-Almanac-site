# GitHub Copilot Instructions for Odin's Almanac (Odin's Eye)

## Project Overview

**Odin's Eye** is a Viking Restaurant Intelligence Platform with AI-powered analytics for restaurant P&L (Profit & Loss) conversion and financial analysis. The application is owned by Viking Restaurant Consultants LLC and is designed for production deployment on Microsoft Azure.

### Core Features
- AI-powered P&L analysis and conversion
- Stripe payment integration with subscription management
- Excel spreadsheet generation for financial reports
- Restaurant data management and analytics
- Secure authentication and authorization
- Azure deployment with monitoring

## Technology Stack

### Backend
- **Runtime:** Node.js v20+ (CommonJS modules)
- **Framework:** Express 5.x
- **Database:** PostgreSQL (via Neon) and Azure Cosmos DB (NoSQL for specific features)
- **AI Integration:** OpenAI API, Anthropic Claude API
- **Payment Processing:** Stripe API
- **Monitoring:** Azure Application Insights
- **Logging:** Winston

### Frontend
- Static HTML/JavaScript (served by Express)
- Dashboard interfaces for analytics
- Interactive P&L builders

### DevOps & Infrastructure
- **Cloud Platform:** Microsoft Azure (App Service)
- **CI/CD:** GitHub Actions
- **Environment Management:** dotenv
- **Deployment:** Azure CLI, PowerShell scripts

### Key Dependencies
- `express` - Web framework
- `stripe` - Payment processing
- `exceljs` - Spreadsheet generation
- `@azure/cosmos` - Database client
- `applicationinsights` - Monitoring
- `helmet` - Security middleware
- `cors` - Cross-origin resource sharing
- `express-rate-limit` - Rate limiting
- `winston` - Logging

## Project Structure

```
.
├── server/                    # Backend server code
│   ├── lib/                  # Core libraries
│   │   ├── ai/              # AI integration (OpenAI, Anthropic)
│   │   ├── auth/            # Authentication middleware
│   │   ├── database/        # Database clients and repositories
│   │   └── env-check.js     # Environment validation
│   ├── routes/              # Express route handlers
│   │   ├── ai.js           # AI endpoints
│   │   └── stripe.js       # Payment endpoints
│   ├── public/             # Static assets
│   └── scripts/            # Utility scripts
├── scripts/                 # Deployment and setup scripts
├── docs/                   # Documentation
├── *.html                  # Frontend dashboards
├── pl-calculator.js        # P&L calculation logic
├── server.js              # Production server entry point
├── server-manager.js      # Server process manager
├── working-ai-server.js   # Development server
└── package.json           # Dependencies and scripts
```

## Development Workflow

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with actual credentials
   ```

3. **Start development server:**
   ```bash
   npm run start:dev     # Production-like server (port 3001)
   npm run dev           # Development AI server
   ```

### Available Scripts

- `npm start` - Start server with manager (production)
- `npm run start:prod` - Start production server directly
- `npm run start:dev` - Start development server
- `npm run dev` - Start AI-enabled development server
- `npm run test` - Run basic server tests
- `npm run test:patents` - Test patent features
- `npm run test:spreadsheet` - Test spreadsheet generation
- `npm run health` - Check server health endpoint
- `npm run build` - No build step (Node.js server)

### Testing

**Important:** Test files are located at the root and in the `server/` directory:
- `simple-server-test.js` - Basic server tests
- `patent-feature-tests.js` - Tests for proprietary restaurant intelligence algorithms
- `test-spreadsheet-generation.js` - Spreadsheet generation tests
- `full_integration_test.js` - Integration tests
- `server/test-ai-endpoints.js` - AI endpoint tests
- `server/test-ai-integration.js` - AI integration tests

**Running tests:**
```bash
node simple-server-test.js
node patent-feature-tests.js
node test-spreadsheet-generation.js
npm run test:patents
npm run test:spreadsheet
```

**Test Guidelines:**
- Tests do NOT use a testing framework like Jest or Mocha
- Tests are standalone Node.js scripts that can be run directly
- Tests should validate actual API responses and file generation
- Include error handling and clear output messages
- Tests may require environment variables to be set

### Linting & Code Quality

**ESLint Configuration:**
- ESLint v9+ is configured in `package.json`
- Configuration is in `eslint.config.js` or inline in `package.json`
- Run: `npx eslint .` (if configured)

**Code Style:**
- Use CommonJS modules (`require`/`module.exports`)
- Use async/await for asynchronous operations
- Follow existing naming conventions
- Include JSDoc comments for complex functions
- Keep security-sensitive code isolated

## Environment Variables

**Critical:** Never commit real API keys or secrets to version control!

### Required Variables
- `STRIPE_PUBLISHABLE_KEY` - Stripe public key
- `STRIPE_SECRET_KEY` - Stripe secret key (keep secure!)
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Application port (default: 3000 or 3001)
- `NODE_ENV` - Environment (development/production)

### Optional Variables
- `APPLICATIONINSIGHTS_CONNECTION_STRING` - Azure monitoring
- `OPENAI_API_KEY` - For GPT features
- `ANTHROPIC_API_KEY` - For Claude features
- `GITHUB_TOKEN` - For GitHub integration
- `FRONTEND_URL` - For CORS configuration
- `SESSION_SECRET` - For session management

See `.env.example` for detailed documentation of all variables.

## Security Considerations

### Critical Security Rules
1. **NEVER** commit `.env` files or real credentials
2. **ALWAYS** validate user input before processing
3. **USE** Helmet.js for security headers (already configured)
4. **ENABLE** rate limiting for all public endpoints
5. **REQUIRE** SSL/TLS for database connections
6. **ROTATE** API keys and secrets every 90 days
7. **USE** environment variables for all sensitive data
8. **VALIDATE** Stripe webhook signatures
9. **SANITIZE** file uploads and spreadsheet data
10. **LOG** security events to Application Insights

### Stripe Security
- Use test keys (`pk_test_`, `sk_test_`) for development
- Validate webhook signatures using Stripe library
- Never expose secret keys in client-side code
- Use Stripe's secure payment forms (no direct card handling)

### Database Security
- Always use parameterized queries
- Enable SSL connections (`sslmode=require`)
- Use connection pooling for performance
- Implement proper error handling without leaking details

## Azure Deployment

### Deployment Process
1. Ensure all tests pass
2. Update environment variables in Azure App Settings
3. Use deployment scripts: `scripts/deploy-odins-eye.ps1` (Windows) or `scripts/deploy-odins-eye.sh` (Linux/Mac)
4. Verify deployment using health checks

### Azure Configuration
- **App Service Plan:** Node 20 LTS
- **Runtime Stack:** Node.js 20.x
- **Port:** Configurable via `PORT` environment variable
- **Startup Command:** `node server.js` or `node server-manager.js`
- **Health Check Path:** `/health`
- **Monitoring:** Application Insights enabled

### GitHub Actions
- Workflows are in `.github/workflows/`
- `azure-deploy.yml` - Main deployment workflow
- `azure-webapp.yml` - Web app deployment
- Requires Azure credentials in repository secrets

## Code Conventions

### File Organization
- Keep route handlers in `server/routes/`
- Business logic in `server/lib/`
- Utility functions in appropriate `lib/` subdirectories
- Static files in `server/public/`
- Tests at root or in `server/`

### Naming Conventions
- **Files:** kebab-case (`ai-consultant.js`, `stripe-routes.js`)
- **Functions:** camelCase (`processPayment`, `generateSpreadsheet`)
- **Constants:** UPPER_SNAKE_CASE (`STRIPE_SECRET_KEY`, `MAX_RETRIES`)
- **Classes:** PascalCase (`RestaurantRepository`, `AIConsultant`)

### Error Handling
```javascript
try {
  // Operation
} catch (error) {
  logger.error('Descriptive message', { error, context });
  res.status(500).json({ error: 'User-friendly message' });
}
```

### Logging
```javascript
const logger = require('./lib/logger'); // Winston logger

logger.info('Operation started', { userId, operation });
logger.error('Operation failed', { error, context });
logger.debug('Debug information', { data });
```

### API Response Format
```javascript
// Success
res.status(200).json({
  success: true,
  data: { ... }
});

// Error
res.status(400).json({
  success: false,
  error: 'Error message'
});
```

## Common Tasks

### Adding a New API Endpoint
1. Create route handler in `server/routes/`
2. Add authentication middleware if needed
3. Implement business logic
4. Add error handling and logging
5. Test the endpoint
6. Update documentation

### Adding Environment Variables
1. Add to `.env.example` with placeholder and description
2. Document in DEPLOYMENT-GUIDE.md
3. Update `server/lib/env-check.js` if validation needed
4. Update Azure App Settings for production

### Generating Spreadsheets
- Use `exceljs` library (already imported in relevant files)
- Follow existing patterns in `pl-calculator.js` (root directory)
- Test with `test-spreadsheet-generation.js`
- Save outputs to `generated-spreadsheets/` directory

### Working with AI Features
- OpenAI integration: See `server/lib/ai/ai-consultant.js`
- Anthropic integration: See AI server files
- Always handle API errors gracefully
- Implement rate limiting for AI endpoints
- Log AI requests for monitoring

## Documentation

### Key Documentation Files
- `README.md` - Quick start and overview
- `DEPLOYMENT-GUIDE.md` - Comprehensive deployment guide
- `ACCESS-GUIDE.md` - Access and permissions guide
- `AI_SETUP_GUIDE.md` - AI features setup
- `.env.example` - Environment variables reference

### Updating Documentation
- Keep README.md updated with new features
- Document all environment variables in `.env.example`
- Update DEPLOYMENT-GUIDE.md for infrastructure changes
- Add inline comments for complex logic

## Best Practices for Copilot

### When Working on Issues
1. **Read thoroughly:** Review all related files before making changes
2. **Minimal changes:** Make the smallest possible changes to fix the issue
3. **Test extensively:** Run all relevant tests before committing
4. **Security first:** Always consider security implications
5. **Document changes:** Update documentation if needed

### Types of Tasks Well-Suited for Copilot
- Bug fixes in existing code
- Adding new API endpoints following existing patterns
- Improving test coverage
- Refactoring for code quality
- Documentation updates
- Adding validation and error handling

### Types of Tasks Requiring Extra Caution
- Changes to authentication/authorization logic
- Stripe payment processing modifications
- Database schema changes
- Security-related code
- Azure deployment configuration
- Environment variable changes affecting production

### Before Submitting a PR
- [ ] All tests pass
- [ ] Code follows existing conventions
- [ ] Security implications reviewed
- [ ] Environment variables documented
- [ ] No secrets committed
- [ ] Documentation updated if needed
- [ ] Error handling implemented
- [ ] Logging added for important operations

## Contact & Support

**Business:** Viking Restaurant Consultants LLC  
**Repository:** Viking-Restaurant-Consultants/Odins-Almanac-site  
**Environment:** Production-ready Azure deployment

For deployment issues, refer to DEPLOYMENT-GUIDE.md or contact repository maintainers.
