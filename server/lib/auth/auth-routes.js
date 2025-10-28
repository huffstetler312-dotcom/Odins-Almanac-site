/**
 * Authentication Routes for Odin's Eye Restaurant Intelligence
 * Viking-themed authentication endpoints with Azure AD B2C integration
 */

const express = require('express');
const { AuthMiddleware } = require('./auth-middleware');

class AuthRoutes {
  constructor() {
    this.router = express.Router();
    this.authMiddleware = new AuthMiddleware();
    this.setupRoutes();
  }

  /**
   * Setup authentication routes
   */
  setupRoutes() {
    // Authentication info endpoint
    this.router.get('/info', this.getAuthInfo.bind(this));
    
    // User profile endpoint (protected)
    this.router.get('/profile', 
      this.authMiddleware.authenticate(),
      this.getProfile.bind(this)
    );
    
    // Token validation endpoint
    this.router.post('/validate', 
      this.authMiddleware.authenticate(),
      this.validateToken.bind(this)
    );
    
    // Logout endpoint
    this.router.post('/logout', 
      this.authMiddleware.optionalAuth(),
      this.logout.bind(this)
    );

    // Viking warrior status endpoint
    this.router.get('/warrior-status',
      this.authMiddleware.authenticate(),
      this.getWarriorStatus.bind(this)
    );

    console.log('⚔️  Authentication routes configured for Viking realm');
  }

  /**
   * Get authentication configuration for client
   * Public endpoint - no authentication required
   */
  async getAuthInfo(req, res) {
    try {
      if (!process.env.AZURE_B2C_TENANT_NAME || !process.env.AZURE_B2C_CLIENT_ID || !process.env.AZURE_B2C_POLICY_NAME) {
        return res.status(500).json({
          success: false,
          error: 'Authentication service not properly configured',
          timestamp: new Date().toISOString()
        });
      }

      const authConfig = {
        clientId: process.env.AZURE_B2C_CLIENT_ID,
        authority: `https://${process.env.AZURE_B2C_TENANT_NAME}.b2clogin.com/${process.env.AZURE_B2C_TENANT_NAME}.onmicrosoft.com/${process.env.AZURE_B2C_POLICY_NAME}`,
        knownAuthorities: [`${process.env.AZURE_B2C_TENANT_NAME}.b2clogin.com`],
        redirectUri: process.env.AZURE_B2C_REDIRECT_URI || `${req.protocol}://${req.get('host')}/auth/callback`,
        postLogoutRedirectUri: process.env.AZURE_B2C_LOGOUT_URI || `${req.protocol}://${req.get('host')}`,
        scopes: ['openid', 'profile', 'email'],
        
        // Viking theme configuration
        theme: {
          name: 'Odin\'s Eye Viking Authentication',
          colors: {
            primary: '#1e40af', // Royal blue
            secondary: '#059669', // Emerald
            accent: '#dc2626' // Viking red
          },
          terminology: {
            signIn: 'Enter the Hall',
            signUp: 'Join the Clan',
            signOut: 'Leave for Valhalla',
            profile: 'Warrior Profile'
          }
        }
      };

      res.json({
        success: true,
        data: authConfig,
        message: 'Authentication configuration for Viking warriors',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('🔥 Error getting auth info:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve authentication information',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get authenticated user profile
   * Protected endpoint - requires valid JWT token
   */
  async getProfile(req, res) {
    try {
      const warrior = req.vikingWarrior;

      // Enhance profile with additional metadata
      const enhancedProfile = {
        ...warrior,
        
        // Battle statistics
        battleStats: {
          rank: warrior.battleRank,
          permissions: warrior.permissions.length,
          restaurantCount: warrior.restaurantAccess.length,
          clanStatus: this.getClanStatus(warrior),
          lastSeen: warrior.lastBattleLogin
        },
        
        // Access summary
        accessSummary: {
          canManageRestaurants: warrior.permissions.includes('restaurant:write'),
          canViewAnalytics: warrior.permissions.includes('analytics:read'),
          canManageInventory: warrior.permissions.includes('inventory:write'),
          canManageUsers: warrior.permissions.includes('users:manage'),
          isJarl: warrior.battleRank === 'Jarl'
        },
        
        // Security info
        security: {
          tokenExpires: warrior.expiresAt,
          issuer: warrior.issuer,
          audience: warrior.audience
        }
      };

      res.json({
        success: true,
        data: enhancedProfile,
        message: `Welcome to Odin's Eye, ${warrior.warriorName} of clan ${warrior.clanName}!`,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('🔥 Error getting profile:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve warrior profile',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Validate JWT token
   * Protected endpoint - validates and returns token info
   */
  async validateToken(req, res) {
    try {
      const warrior = req.vikingWarrior;
      
      // Calculate token validity
      const now = new Date();
      const expiresAt = new Date(warrior.expiresAt);
      const issuedAt = new Date(warrior.issuedAt);
      const timeToExpiry = expiresAt.getTime() - now.getTime();
      const tokenAge = now.getTime() - issuedAt.getTime();

      const tokenInfo = {
        valid: true,
        warrior: {
          objectId: warrior.objectId,
          name: warrior.displayName,
          battleRank: warrior.battleRank,
          email: warrior.email
        },
        timing: {
          issuedAt: warrior.issuedAt,
          expiresAt: warrior.expiresAt,
          timeToExpiry: Math.max(0, Math.floor(timeToExpiry / 1000)), // seconds
          tokenAge: Math.floor(tokenAge / 1000), // seconds
          isExpired: timeToExpiry <= 0
        },
        permissions: warrior.permissions,
        restaurantAccess: warrior.restaurantAccess
      };

      res.json({
        success: true,
        data: tokenInfo,
        message: 'Token validation successful - Viking credentials verified',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('🔥 Error validating token:', error.message);
      res.status(500).json({
        success: false,
        error: 'Token validation failed',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Logout endpoint
   * Provides logout URL and clears any server-side session data
   */
  async logout(req, res) {
    try {
      const logoutUrl = `https://${process.env.AZURE_B2C_TENANT_NAME}.b2clogin.com/${process.env.AZURE_B2C_TENANT_NAME}.onmicrosoft.com/${process.env.AZURE_B2C_POLICY_NAME}/oauth2/v2.0/logout?post_logout_redirect_uri=${encodeURIComponent(process.env.AZURE_B2C_LOGOUT_URI || `${req.protocol}://${req.get('host')}`)}`;

      // Log warrior departure if authenticated
      if (req.vikingWarrior) {
        console.log(`🚪 Viking warrior '${req.vikingWarrior.warriorName}' has left for Valhalla`, {
          objectId: req.vikingWarrior.objectId,
          battleRank: req.vikingWarrior.battleRank,
          sessionDuration: new Date().getTime() - new Date(req.vikingWarrior.lastBattleLogin).getTime()
        });
      }

      res.json({
        success: true,
        data: {
          logoutUrl,
          message: 'Until we meet again in Valhalla, brave warrior!'
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('🔥 Error during logout:', error.message);
      res.status(500).json({
        success: false,
        error: 'Logout failed - The gates of Valhalla are stuck',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get Viking warrior status with battle metrics
   * Protected endpoint - requires authentication
   */
  async getWarriorStatus(req, res) {
    try {
      const warrior = req.vikingWarrior;
      
      const status = {
        identity: {
          warriorName: warrior.warriorName,
          clanName: warrior.clanName,
          battleRank: warrior.battleRank,
          email: warrior.email
        },
        
        realm: {
          restaurantCount: warrior.restaurantAccess.length,
          restaurantIds: warrior.restaurantAccess,
          primaryHall: warrior.restaurantAccess[0] || null
        },
        
        battleReadiness: {
          permissions: warrior.permissions,
          permissionCount: warrior.permissions.length,
          canFight: warrior.permissions.length > 0,
          isJarl: warrior.battleRank === 'Jarl'
        },
        
        session: {
          enteredRealm: warrior.lastBattleLogin,
          tokenExpires: warrior.expiresAt,
          timeRemaining: Math.max(0, Math.floor((new Date(warrior.expiresAt).getTime() - new Date().getTime()) / 1000))
        },
        
        clanStatus: this.getClanStatus(warrior)
      };

      res.json({
        success: true,
        data: status,
        message: `Battle status for ${warrior.warriorName} - Ready for conquest!`,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('🔥 Error getting warrior status:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve battle status',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Determine clan status based on warrior profile
   * @param {Object} warrior - Viking warrior profile
   * @returns {Object} Clan status information
   */
  getClanStatus(warrior) {
    let status = 'unknown';
    let description = 'Status unknown';
    
    if (warrior.battleRank === 'Jarl') {
      status = 'ruler';
      description = 'Rules over multiple halls with supreme authority';
    } else if (warrior.battleRank === 'Hirdman') {
      status = 'trusted';
      description = 'Trusted retainer with significant responsibilities';
    } else if (warrior.battleRank === 'Huskarl') {
      status = 'warrior';
      description = 'Seasoned warrior with hall access';
    } else if (warrior.battleRank === 'Thrall') {
      status = 'initiate';
      description = 'New to the clan, proving worthiness';
    }

    return {
      status,
      description,
      rank: warrior.battleRank,
      hasHalls: warrior.restaurantAccess.length > 0,
      canCommand: ['Jarl', 'Hirdman'].includes(warrior.battleRank)
    };
  }

  /**
   * Get router instance
   * @returns {Express.Router} Configured router
   */
  getRouter() {
    return this.router;
  }
}

module.exports = { AuthRoutes };