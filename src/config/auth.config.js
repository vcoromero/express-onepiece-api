/**
 * Authentication Configuration
 * Handles different environments (local vs AWS)
 */

const getAdminCredentials = () => {
  const adminUsername = process.env.ADMIN_USERNAME;
  let adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  
  // Handle escaped $ characters for AWS deployment
  if (adminPasswordHash && !adminPasswordHash.startsWith('$2b$')) {
    // If hash doesn't start with $2b$, it might be escaped
    adminPasswordHash = adminPasswordHash.replace(/\\\$/g, '$');
  }
  
  return {
    username: adminUsername,
    passwordHash: adminPasswordHash
  };
};

module.exports = {
  getAdminCredentials
};
