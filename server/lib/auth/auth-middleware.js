/**
 * Authentication Middleware for Odin's Eye Restaurant Intelligence
 * Viking-themed authorization with role-based access control
 */

const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

class AuthMiddleware {
  constructor() {
    this.jwksClient = this.setupJwksClient();
  }

  /**
   * Setup JWKS client for token signature verification
   * Following Azure security best practices
   */
  setupJwksClient() {
    if (!process.env.AZURE_B2C_TENANT_NAME) {
      throw new Error('AZURE_B2C_TENANT_NAME environment variable is required');
    }

    const jwksUri = `https://${process.env.AZURE_B2C_TENANT_NAME}.b2clogin.com/${process.env.AZURE_B2C_TENANT_NAME}.onmicrosoft.com/${process.env.AZURE_B2C_POLICY_NAME}/discovery/v2.0/keys`;

    return jwksClient({
      jwksUri,
      cache: true,
      cacheMaxAge: 600000, // 10 minutes
      rateLimit: true,
      jwksRequestsPerMinute: 5
    });
  }

  /**
   * Get signing key for JWT verification
   * @param {Object} header - JWT header
   * @param {Function} callback - Callback function
   */
  getSigningKey = (header, callback) => {
    this.jwksClient.getSigningKey(header.kid, (err, key) => {
      if (err) {
        console.error('🔥 Error getting signing key:', err.message);
        return callback(err);
      }
      
      const signingKey = key.publicKey || key.rsaPublicKey;
      callback(null, signingKey);
    });
  }

  /**
   * Verify and decode JWT token
   * @param {string} token - JWT token string
   * @returns {Promise<Object>} Decoded token
   */
  verifyToken(token) {
    return new Promise((resolve, reject) => {
      // Decode header to get key ID
      const decoded = jwt.decode(token, { complete: true });
      
      if (!decoded || !decoded.header || !decoded.header.kid) {
        return reject(new Error('Invalid token structure'));
      }

      // Get signing key and verify token
      this.getSigningKey(decoded.header, (err, signingKey) => {
        if (err) {
          return reject(err);
        }

        jwt.verify(token, signingKey, {
          algorithms: ['RS256'],
          audience: process.env.AZURE_B2C_CLIENT_ID,
          issuer: `https://${process.env.AZURE_B2C_TENANT_NAME}.b2clogin.com/${process.env.AZURE_B2C_TENANT_ID || process.env.AZURE_B2C_TENANT_NAME + '.onmicrosoft.com'}/v2.0/`
        }, (verifyErr, verifiedToken) => {
          if (verifyErr) {
            return reject(verifyErr);
          }
          resolve(verifiedToken);
        });
      });
    });
  }

  /**
   * Middleware to authenticate Viking warriors
   * @returns {Function} Express middleware function
   */
  authenticate() {
    return async (req, res, next) => {
      try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({
            success: false,
            error: 'No bearer token provided - The gates of Valhalla remain closed',
            code: 'NO_TOKEN',
            timestamp: new Date().toISOString()
          });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = await this.verifyToken(token);

        // Create Viking warrior profile
        const vikingWarrior = {
          // Core Identity
          objectId: decoded.oid || decoded.sub,
          email: decoded.email || decoded.emails?.[0],
          displayName: decoded.name || `${decoded.given_name || ''} ${decoded.family_name || ''}`.trim(),
          
          // Viking Battle Identity
          warriorName: decoded.given_name || 'Unknown Warrior',
          clanName: decoded.family_name || 'Wandering Viking',
          
          // Restaurant Access Rights
          restaurantAccess: this.extractRestaurantAccess(decoded),
          
          // System Metadata
          tenantId: decoded.tid,
          issuer: decoded.iss,
          audience: decoded.aud,
          issuedAt: new Date(decoded.iat * 1000).toISOString(),
          expiresAt: new Date(decoded.exp * 1000).toISOString(),
          
          // Viking Theme Properties
          battleRank: this.determineBattleRank(decoded),
          permissions: this.extractPermissions(decoded),
          lastBattleLogin: new Date().toISOString(),
          
          // Raw token data for advanced operations
          rawToken: decoded
        };

        // Attach to request object
        req.vikingWarrior = vikingWarrior;
        req.user = vikingWarrior; // Standard Express user object

        console.log(`⚔️  Viking warrior '${vikingWarrior.warriorName}' authenticated successfully`, {
          objectId: vikingWarrior.objectId,
          battleRank: vikingWarrior.battleRank,
          permissions: vikingWarrior.permissions.length,
          restaurantAccess: vikingWarrior.restaurantAccess.length
        });

        next();

      } catch (error) {
        console.error('🛡️  Authentication failed:', {
          error: error.message,
          timestamp: new Date().toISOString()
        });

        res.status(401).json({
          success: false,
          error: 'Authentication failed - Your battle credentials are invalid',
          code: 'INVALID_TOKEN',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
          timestamp: new Date().toISOString()
        });
      }
    };
  }

  /**
   * Middleware to authorize based on permissions
   * @param {string|Array} requiredPermissions - Required permission(s)
   * @returns {Function} Express middleware function
   */
  authorize(requiredPermissions) {
    const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
    
    return (req, res, next) => {
      if (!req.vikingWarrior) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required - You must prove your Viking identity',
          code: 'NOT_AUTHENTICATED',
          timestamp: new Date().toISOString()
        });
      }

      const userPermissions = req.vikingWarrior.permissions || [];
      const hasPermission = permissions.some(perm => userPermissions.includes(perm));

      if (!hasPermission) {
        console.warn(`🚨 Authorization denied for warrior '${req.vikingWarrior.warriorName}'`, {
          required: permissions,
          available: userPermissions,
          battleRank: req.vikingWarrior.battleRank
        });

        return res.status(403).json({
          success: false,
          error: `Access denied - Your battle rank '${req.vikingWarrior.battleRank}' lacks the required permissions`,
          code: 'INSUFFICIENT_PERMISSIONS',
          required: permissions,
          available: userPermissions,
          timestamp: new Date().toISOString()
        });
      }

      next();
    };
  }

  /**
   * Middleware to authorize restaurant access
   * @param {string} paramName - Parameter name containing restaurant ID (default: 'restaurantId')
   * @returns {Function} Express middleware function
   */
  authorizeRestaurant(paramName = 'restaurantId') {
    return (req, res, next) => {
      if (!req.vikingWarrior) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required - Viking identity not verified',
          code: 'NOT_AUTHENTICATED',
          timestamp: new Date().toISOString()
        });
      }

      const requestedRestaurantId = req.params[paramName] || req.body.restaurantId;
      
      if (!requestedRestaurantId) {
        return res.status(400).json({
          success: false,
          error: 'Restaurant ID required for this operation',
          code: 'MISSING_RESTAURANT_ID',
          timestamp: new Date().toISOString()
        });
      }

      const hasRestaurantAccess = req.vikingWarrior.restaurantAccess.includes(requestedRestaurantId) ||
                                  req.vikingWarrior.battleRank === 'Jarl'; // Jarl has access to all restaurants

      if (!hasRestaurantAccess) {
        console.warn(`🏰 Restaurant access denied for warrior '${req.vikingWarrior.warriorName}'`, {
          requested: requestedRestaurantId,
          available: req.vikingWarrior.restaurantAccess,
          battleRank: req.vikingWarrior.battleRank
        });

        return res.status(403).json({
          success: false,
          error: `Access denied to restaurant '${requestedRestaurantId}' - Your clan does not rule this hall`,
          code: 'RESTAURANT_ACCESS_DENIED',
          timestamp: new Date().toISOString()
        });
      }

      next();
    };
  }

  /**
   * Extract restaurant access from token claims
   */
  extractRestaurantAccess(token) {
    try {
      const restaurantClaims = token.extension_RestaurantAccess || token.restaurant_access || [];
      
      if (typeof restaurantClaims === 'string') {
        return restaurantClaims.split(',').map(id => id.trim());
      }
      
      if (Array.isArray(restaurantClaims)) {
        return restaurantClaims;
      }
      
      return [];
    } catch (error) {
      console.warn('⚠️ Error extracting restaurant access:', error.message);
      return [];
    }
  }

  /**
   * Determine Viking battle rank from token
   */
  determineBattleRank(token) {
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
    
    return 'Thrall'; // Basic access
  }

  /**
   * Extract permissions from token
   */
  extractPermissions(token) {
    const permissions = new Set();
    
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

    const explicitPermissions = token.extension_Permissions || token.permissions || [];
    explicitPermissions.forEach(perm => permissions.add(perm));

    return Array.from(permissions);
  }

  /**
   * Optional middleware - allows unauthenticated requests but adds user info if available
   * @returns {Function} Express middleware function
   */
  optionalAuth() {
    return async (req, res, next) => {
      try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return next(); // Continue without authentication
        }

        const token = authHeader.substring(7);
        const decoded = await this.verifyToken(token);

        // Set user info without requiring authentication
        req.vikingWarrior = this.createWarriorProfile(decoded);
        req.user = req.vikingWarrior;

        next();
      } catch (error) {
        // Log error but continue without authentication
        console.warn('⚠️ Optional authentication failed:', error.message);
        next();
      }
    };
  }

  /**
   * Create warrior profile from decoded token
   */
  createWarriorProfile(decoded) {
    return {
      objectId: decoded.oid || decoded.sub,
      email: decoded.email || decoded.emails?.[0],
      displayName: decoded.name || `${decoded.given_name || ''} ${decoded.family_name || ''}`.trim(),
      warriorName: decoded.given_name || 'Unknown Warrior',
      clanName: decoded.family_name || 'Wandering Viking',
      restaurantAccess: this.extractRestaurantAccess(decoded),
      battleRank: this.determineBattleRank(decoded),
      permissions: this.extractPermissions(decoded),
      lastBattleLogin: new Date().toISOString(),
      rawToken: decoded
    };
  }
}

module.exports = { AuthMiddleware };