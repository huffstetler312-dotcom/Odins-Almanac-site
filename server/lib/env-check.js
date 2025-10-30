/**
 * Environment Variable Checker Utility
 * Viking Restaurant Consultants LLC
 * 
 * Helps validate required environment variables are present
 */

/**
 * Check if required environment variables are present
 * @param {string[]} requiredVars - Array of environment variable names to check
 * @returns {string[]} Array of missing environment variable names
 */
function listMissingEnv(requiredVars) {
  if (!Array.isArray(requiredVars)) {
    throw new TypeError('requiredVars must be an array of strings');
  }
  
  const missing = [];
  
  for (const varName of requiredVars) {
    if (typeof varName !== 'string') {
      throw new TypeError(`All elements in requiredVars must be strings, got ${typeof varName}`);
    }
    
    // Check if the environment variable is missing or empty
    if (!process.env[varName] || process.env[varName].trim() === '') {
      missing.push(varName);
    }
  }
  
  return missing;
}

module.exports = {
  listMissingEnv
};
