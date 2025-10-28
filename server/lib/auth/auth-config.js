/**
 * Azure AD B2C Authentication Configuration for Odin's Eye
 * Viking-themed authentication with JWT token validation
 */

const passport = require('passport');
const BearerStrategy = require('passport-azure-ad').BearerStrategy;

class AuthConfig {
  constructor() {
    this.initializeConfig();
    this.setupBearerStrategy();
  }

  /**
   * Initialize Azure AD B2C configuration
   * Following Azure security best practices with environment-based config
   */
  initializeConfig() {
    // Validate required environment variables
    const requiredEnvVars = [
      'AZURE_B2C_TENANT_NAME',
      'AZURE_B2C_CLIENT_ID',
      'AZURE_B2C_POLICY_NAME'
    ];

    requiredEnvVars.forEach(envVar => {
      if (!process.env[envVar]) {
        throw new Error(`🔥 Missing required environment variable: ${envVar}`);
      }
    });

    this.config = {
      // Azure AD B2C Identity Provider Configuration
      identityMetadata: `https://${process.env.AZURE_B2C_TENANT_NAME}.b2clogin.com/${process.env.AZURE_B2C_TENANT_NAME}.onmicrosoft.com/${process.env.AZURE_B2C_POLICY_NAME}/v2.0/.well-known/openid_configuration`,
      
      // Application Configuration
      clientID: process.env.AZURE_B2C_CLIENT_ID,
      audience: process.env.AZURE_B2C_CLIENT_ID,
      
      // Token Validation Settings
      validateIssuer: true,
      issuer: `https://${process.env.AZURE_B2C_TENANT_NAME}.b2clogin.com/${process.env.AZURE_B2C_TENANT_ID || process.env.AZURE_B2C_TENANT_NAME + '.onmicrosoft.com'}/v2.0/`,
      
      // Security Configuration
      passReqToCallback: true,
      loggingLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
      
      // Viking Theme - Scope Configuration
      scope: ['openid', 'profile', 'email', 'restaurant_access'],
      
      // Clock skew tolerance (5 minutes)
      clockSkew: 300
    };

    console.log('⚔️  Azure AD B2C configuration initialized for Odin\'s Eye');
  }

  /**
   * Setup Bearer Strategy for JWT token validation
   * Implements Azure best practices for API protection
   */
  setupBearerStrategy() {
    const bearerStrategy = new BearerStrategy(this.config, (req, token, done) => {
      try {
        // Validate token and extract user claims
        if (!token || !token.oid) {
          console.warn('🚨 Invalid token received - missing object ID');
          return done(new Error('Invalid token: missing object identifier'), null);
        }

        // Extract Viking warrior profile from token
        const vikingWarrior = {
          // Core Identity
          objectId: token.oid,
          email: token.email || token.emails?.[0],
          displayName: token.name || `${token.given_name} ${token.family_name}`,
          
          // Viking Battle Identity
          warriorName: token.given_name || 'Unknown Warrior',
          clanName: token.family_name || 'Wandering Viking',
          
          // Restaurant Access Rights
          restaurantAccess: this.extractRestaurantAccess(token),
          
          // System Metadata
          tenantId: token.tid,
          issuer: token.iss,
          audience: token.aud,
          issuedAt: new Date(token.iat * 1000).toISOString(),
          expiresAt: new Date(token.exp * 1000).toISOString(),
          
          // Viking Theme Properties
          battleRank: this.determineBattleRank(token),
          permissions: this.extractPermissions(token),
          lastBattleLogin: new Date().toISOString()
        };

        // Log successful authentication
        console.log(`🏰 Viking warrior '${vikingWarrior.warriorName}' has entered the realm`, {
          objectId: vikingWarrior.objectId,
          email: vikingWarrior.email,
          battleRank: vikingWarrior.battleRank,
          restaurantAccess: vikingWarrior.restaurantAccess.length
        });

        // Attach warrior profile to request
        req.vikingWarrior = vikingWarrior;
        
        return done(null, vikingWarrior, token);
        
      } catch (error) {
        console.error('🔥 Authentication error during token validation:', {
          error: error.message,
          tokenSub: token?.sub,
          timestamp: new Date().toISOString()
        });
        
        return done(error, null);
      }
    });

    passport.use(bearerStrategy);
    console.log('🛡️  Bearer strategy configured for Viking authentication');
  }

  /**
   * Extract restaurant access permissions from token
   * @param {Object} token - JWT token claims
   * @returns {Array} Array of restaurant IDs the user can access
   */
  extractRestaurantAccess(token) {
    try {
      // Check for restaurant claims in token
      const restaurantClaims = token.extension_RestaurantAccess || token.restaurant_access || [];
      
      if (typeof restaurantClaims === 'string') {
        return restaurantClaims.split(',').map(id => id.trim());
      }
      
      if (Array.isArray(restaurantClaims)) {
        return restaurantClaims;
      }
      
      // Default to empty access (will be handled by authorization middleware)
      return [];
      
    } catch (error) {
      console.warn('⚠️ Error extracting restaurant access from token:', error.message);
      return [];
    }
  }

  /**
   * Determine Viking battle rank based on token claims
   * @param {Object} token - JWT token claims
   * @returns {string} Battle rank for Viking theme
   */
  determineBattleRank(token) {
    // Check for custom role claims
    const roles = token.extension_Roles || token.roles || [];
    
    if (roles.includes('owner') || roles.includes('admin')) {
      return 'Jarl'; // Norse Earl - highest rank
    }
    
    if (roles.includes('manager')) {
      return 'Hirdman'; // Trusted retainer
    }
    
    if (roles.includes('staff')) {
      return 'Huskarl'; // Household warrior
    }
    
    return 'Thrall'; // Basic access - needs permission assignment
  }

  /**
   * Extract permissions from token claims
   * @param {Object} token - JWT token claims
   * @returns {Array} Array of permissions
   */
  extractPermissions(token) {
    const permissions = new Set();
    
    // Extract from roles
    const roles = token.extension_Roles || token.roles || [];
    roles.forEach(role => {
      switch (role.toLowerCase()) {
        case 'owner':
        case 'admin':
          permissions.add('restaurant:read');
          permissions.add('restaurant:write');
          permissions.add('inventory:read');
          permissions.add('inventory:write');
          permissions.add('analytics:read');
          permissions.add('users:manage');
          break;
        case 'manager':
          permissions.add('restaurant:read');
          permissions.add('inventory:read');
          permissions.add('inventory:write');
          permissions.add('analytics:read');
          break;
        case 'staff':
          permissions.add('inventory:read');
          permissions.add('inventory:write');
          break;
      }
    });

    // Extract from explicit permissions claim
    const explicitPermissions = token.extension_Permissions || token.permissions || [];
    explicitPermissions.forEach(perm => permissions.add(perm));

    return Array.from(permissions);
  }

  /**
   * Get middleware for authenticating requests
   * @returns {Function} Passport authentication middleware
   */
  getAuthenticationMiddleware() {
    return passport.authenticate('oauth-bearer', { session: false });
  }

  /**
   * Get configuration for client-side authentication
   * @returns {Object} Client configuration object
   */
  getClientConfig() {
    return {
      clientId: this.config.clientID,
      authority: `https://${process.env.AZURE_B2C_TENANT_NAME}.b2clogin.com/${process.env.AZURE_B2C_TENANT_NAME}.onmicrosoft.com/${process.env.AZURE_B2C_POLICY_NAME}`,
      knownAuthorities: [`${process.env.AZURE_B2C_TENANT_NAME}.b2clogin.com`],
      redirectUri: process.env.AZURE_B2C_REDIRECT_URI || 'http://localhost:3000/auth/callback',
      postLogoutRedirectUri: process.env.AZURE_B2C_LOGOUT_URI || 'http://localhost:3000',
      scopes: ['openid', 'profile', 'email']
    };
  }
}

module.exports = { AuthConfig };