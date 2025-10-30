/**
 * Authentication Module Index for Odin's Eye
 * Exports all authentication components with Viking theme
 */

const { AuthConfig } = require('./auth-config');
const { AuthMiddleware } = require('./auth-middleware');
const { AuthRoutes } = require('./auth-routes');

// Create singleton instances
const authMiddleware = new AuthMiddleware();
const authRoutes = new AuthRoutes();

/**
 * Initialize authentication system
 * @returns {Promise<Object>} Initialization result
 */
async function initializeAuth() {
  try {
    console.log('🏰 Initializing Odin\'s Eye authentication system...');
    
    // Validate required environment variables
    const requiredVars = [
      'AZURE_B2C_TENANT_NAME',
      'AZURE_B2C_CLIENT_ID', 
      'AZURE_B2C_POLICY_NAME'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      const error = `Missing required Azure B2C environment variables: ${missingVars.join(', ')}`;
      console.error('🔥', error);
      
      return {
        status: 'warning',
        message: 'Authentication system initialized with limited functionality',
        missingConfig: missingVars,
        canAuthenticate: false
      };
    }

    console.log('⚔️  Azure AD B2C authentication configured successfully');
    console.log(`🛡️  Tenant: ${process.env.AZURE_B2C_TENANT_NAME}`);
    console.log(`🏆 Policy: ${process.env.AZURE_B2C_POLICY_NAME}`);
    
    return {
      status: 'success',
      message: 'Viking authentication system ready for battle!',
      canAuthenticate: true,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('💀 Failed to initialize authentication system:', error.message);
    
    return {
      status: 'error',
      message: 'Authentication system initialization failed',
      error: error.message,
      canAuthenticate: false,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Middleware factory functions for easy use
 */
const middleware = {
  // Authentication middleware
  authenticate: () => authMiddleware.authenticate(),
  
  // Optional authentication (allows unauthenticated requests)
  optionalAuth: () => authMiddleware.optionalAuth(),
  
  // Permission-based authorization
  authorize: (permissions) => authMiddleware.authorize(permissions),
  
  // Restaurant-specific authorization
  authorizeRestaurant: (paramName) => authMiddleware.authorizeRestaurant(paramName),
  
  // Combined auth + permission check
  requirePermission: (permissions) => [
    authMiddleware.authenticate(),
    authMiddleware.authorize(permissions)
  ],
  
  // Combined auth + restaurant access check
  requireRestaurantAccess: (paramName) => [
    authMiddleware.authenticate(),
    authMiddleware.authorizeRestaurant(paramName)
  ],
  
  // Viking rank-based access
  requireRank: (minimumRank) => [
    authMiddleware.authenticate(),
    (req, res, next) => {
      const rankOrder = { 'Thrall': 0, 'Huskarl': 1, 'Hirdman': 2, 'Jarl': 3 };
      const userRankLevel = rankOrder[req.vikingWarrior?.battleRank] || 0;
      const requiredLevel = rankOrder[minimumRank] || 0;
      
      if (userRankLevel < requiredLevel) {
        return res.status(403).json({
          success: false,
          error: `Battle rank '${minimumRank}' or higher required. Your rank: ${req.vikingWarrior?.battleRank || 'Unknown'}`,
          code: 'INSUFFICIENT_RANK',
          timestamp: new Date().toISOString()
        });
      }
      
      next();
    }
  ]
};

/**
 * Pre-configured middleware combinations for common scenarios
 */
const presets = {
  // Owner/Admin only
  ownerOnly: middleware.requireRank('Jarl'),
  
  // Manager or higher
  managerOrHigher: middleware.requireRank('Hirdman'),
  
  // Any authenticated user
  authenticatedUser: middleware.authenticate(),
  
  // Restaurant management access
  restaurantManager: [
    ...middleware.requirePermission(['restaurant:write']),
    middleware.authorizeRestaurant()
  ],
  
  // Inventory management access
  inventoryManager: [
    ...middleware.requirePermission(['inventory:write']),
    middleware.authorizeRestaurant()
  ],
  
  // Analytics access
  analyticsViewer: [
    ...middleware.requirePermission(['analytics:read']),
    middleware.authorizeRestaurant()
  ]
};

/**
 * Utility functions
 */
const utils = {
  /**
   * Extract user info from request (if authenticated)
   * @param {Object} req - Express request object
   * @returns {Object|null} User info or null
   */
  getUser: (req) => req.vikingWarrior || req.user || null,
  
  /**
   * Check if user has specific permission
   * @param {Object} req - Express request object
   * @param {string} permission - Permission to check
   * @returns {boolean} Has permission
   */
  hasPermission: (req, permission) => {
    const user = utils.getUser(req);
    return user?.permissions?.includes(permission) || false;
  },
  
  /**
   * Check if user can access specific restaurant
   * @param {Object} req - Express request object
   * @param {string} restaurantId - Restaurant ID
   * @returns {boolean} Has access
   */
  canAccessRestaurant: (req, restaurantId) => {
    const user = utils.getUser(req);
    return user?.restaurantAccess?.includes(restaurantId) || 
           user?.battleRank === 'Jarl' || 
           false;
  },
  
  /**
   * Get user's battle rank
   * @param {Object} req - Express request object
   * @returns {string} Battle rank
   */
  getBattleRank: (req) => {
    const user = utils.getUser(req);
    return user?.battleRank || 'Unknown';
  },
  
  /**
   * Check if user is authenticated
   * @param {Object} req - Express request object
   * @returns {boolean} Is authenticated
   */
  isAuthenticated: (req) => !!utils.getUser(req)
};

module.exports = {
  // Core components
  AuthConfig,
  AuthMiddleware,
  AuthRoutes,
  
  // Singleton instances
  authMiddleware,
  authRoutes,
  
  // Initialization
  initializeAuth,
  
  // Middleware factories
  middleware,
  presets,
  utils,
  
  // Router
  getAuthRouter: () => authRoutes.getRouter()
};