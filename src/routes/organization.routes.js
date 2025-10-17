const express = require('express');
const router = express.Router();
const OrganizationController = require('../controllers/organization.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { createRateLimiter } = require('../middlewares/rate-limiter');

/**
 * Organization Routes
 * @description Route definitions for organization endpoints with proper middleware
 * @author Database Expert
 * @version 1.0.0
 */

// ============================================
// PUBLIC ROUTES (Read-only, no authentication required)
// ============================================

/**
 * @route GET /api/organizations
 * @description Get all organizations with pagination and filtering
 * @access Public
 * @rateLimit 100 requests per 15 minutes
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 10, max: 100)
 * @query {string} search - Search term for organization name
 * @query {string} status - Filter by status (active, disbanded, destroyed)
 * @query {number} organizationTypeId - Filter by organization type ID
 * @query {string} sortBy - Sort field (name, totalBounty, status, createdAt)
 * @query {string} sortOrder - Sort order (ASC, DESC)
 * @returns {Object} Paginated list of organizations
 */
router.get('/', 
  createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many requests for organizations, please try again later',
    standardHeaders: true,
    legacyHeaders: false
  }),
  OrganizationController.getAllOrganizations
);

/**
 * @route GET /api/organizations/:id
 * @description Get organization by ID with full details
 * @access Public
 * @rateLimit 100 requests per 15 minutes
 * @param {number} id - Organization ID
 * @returns {Object} Organization with relationships
 */
router.get('/:id',
  createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many requests for organization details, please try again later',
    standardHeaders: true,
    legacyHeaders: false
  }),
  OrganizationController.getOrganizationById
);

/**
 * @route GET /api/organizations/type/:organizationTypeId
 * @description Get organizations by type
 * @access Public
 * @rateLimit 100 requests per 15 minutes
 * @param {number} organizationTypeId - Organization type ID
 * @returns {Object} Organizations of specified type
 */
router.get('/type/:organizationTypeId',
  createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many requests for organizations by type, please try again later',
    standardHeaders: true,
    legacyHeaders: false
  }),
  OrganizationController.getOrganizationsByType
);

/**
 * @route GET /api/organizations/:id/members
 * @description Get organization members
 * @access Public
 * @rateLimit 100 requests per 15 minutes
 * @param {number} id - Organization ID
 * @returns {Object} Organization members
 */
router.get('/:id/members',
  createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many requests for organization members, please try again later',
    standardHeaders: true,
    legacyHeaders: false
  }),
  OrganizationController.getOrganizationMembers
);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

/**
 * @route POST /api/organizations
 * @description Create new organization
 * @access Private (JWT required)
 * @rateLimit 50 requests per 15 minutes
 * @body {string} name - Organization name (required)
 * @body {number} organizationTypeId - Organization type ID (required)
 * @body {number} leaderId - Leader character ID (optional)
 * @body {number} shipId - Ship ID (optional)
 * @body {string} flagDescription - Flag description (optional)
 * @body {string} jollyRogerUrl - Jolly Roger image URL (optional)
 * @body {string} baseLocation - Base location (optional)
 * @body {number} totalBounty - Total bounty in Berries (optional, default: 0)
 * @body {string} status - Organization status (optional, default: active)
 * @body {string} description - Organization description (optional)
 * @body {string} foundedDate - Founded date (optional)
 * @returns {Object} Created organization
 */
router.post('/',
  authMiddleware, // JWT authentication required
  createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 requests per window for authenticated users
    message: 'Too many requests for creating organizations, please try again later',
    standardHeaders: true,
    legacyHeaders: false
  }),
  OrganizationController.createOrganization
);

/**
 * @route PUT /api/organizations/:id
 * @description Update organization
 * @access Private (JWT required)
 * @rateLimit 50 requests per 15 minutes
 * @param {number} id - Organization ID
 * @body {string} name - Organization name (optional)
 * @body {number} organizationTypeId - Organization type ID (optional)
 * @body {number} leaderId - Leader character ID (optional)
 * @body {number} shipId - Ship ID (optional)
 * @body {string} flagDescription - Flag description (optional)
 * @body {string} jollyRogerUrl - Jolly Roger image URL (optional)
 * @body {string} baseLocation - Base location (optional)
 * @body {number} totalBounty - Total bounty in Berries (optional)
 * @body {string} status - Organization status (optional)
 * @body {string} description - Organization description (optional)
 * @body {string} foundedDate - Founded date (optional)
 * @returns {Object} Updated organization
 */
router.put('/:id',
  authMiddleware, // JWT authentication required
  createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 requests per window for authenticated users
    message: 'Too many requests for updating organizations, please try again later',
    standardHeaders: true,
    legacyHeaders: false
  }),
  OrganizationController.updateOrganization
);

/**
 * @route DELETE /api/organizations/:id
 * @description Delete organization
 * @access Private (JWT required)
 * @rateLimit 50 requests per 15 minutes
 * @param {number} id - Organization ID
 * @returns {Object} Deletion result
 * @note Cannot delete organization with active members
 */
router.delete('/:id',
  authMiddleware, // JWT authentication required
  createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 requests per window for authenticated users
    message: 'Too many requests for deleting organizations, please try again later',
    standardHeaders: true,
    legacyHeaders: false
  }),
  OrganizationController.deleteOrganization
);

module.exports = router;
