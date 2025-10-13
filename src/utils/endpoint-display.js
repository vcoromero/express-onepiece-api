/**
 * Endpoint Display Utility
 * 
 * Displays all available API endpoints in a formatted way
 * when the server starts up
 */

/**
 * Extract routes from Express app
 * @param {Object} app - Express application instance
 * @returns {Array} Array of route objects
 */
function extractRoutes(app) {
  const routes = [];
  
  // Helper function to process stack
  function processStack(stack, basePath = '') {
    stack.forEach((layer) => {
      if (layer.route) {
        // This is a route
        const methods = Object.keys(layer.route.methods).map(method => method.toUpperCase());
        const path = basePath + layer.route.path;
        
        routes.push({
          method: methods.join(', '),
          path: path,
          fullPath: path
        });
      } else if (layer.name === 'router' && layer.regexp) {
        // This is a router
        const routerPath = layer.regexp.source
          .replace('\\/?', '')
          .replace('(?=\\/|$)', '')
          .replace(/\\\//g, '/')
          .replace(/\^/g, '')
          .replace(/\$/g, '')
          .replace(/\\/g, '')
          .replace(/\?/g, '');
        
        const cleanPath = routerPath === '^/$' ? '' : routerPath;
        const newBasePath = basePath + cleanPath;
        
        if (layer.handle && layer.handle.stack) {
          processStack(layer.handle.stack, newBasePath);
        }
      }
    });
  }
  
  if (app._router && app._router.stack) {
    processStack(app._router.stack);
  }
  
  return routes;
}

/**
 * Format routes for display
 * @param {Array} routes - Array of route objects
 * @returns {String} Formatted string for display
 */
function formatRoutesForDisplay(routes) {
  if (routes.length === 0) {
    return 'No routes found';
  }
  
  // Group routes by path for better organization
  const groupedRoutes = {};
  routes.forEach(route => {
    if (!groupedRoutes[route.path]) {
      groupedRoutes[route.path] = [];
    }
    groupedRoutes[route.path].push(route.method);
  });
  
  let display = '\n🌊 ONE PIECE API - Available Endpoints 🌊\n';
  display += '═'.repeat(60) + '\n';
  
  // Sort routes by path
  const sortedPaths = Object.keys(groupedRoutes).sort();
  
  sortedPaths.forEach(path => {
    const methods = groupedRoutes[path];
    const methodStr = methods.join(' | ');
    const paddedMethods = methodStr.padEnd(20);
    
    display += `📡 ${paddedMethods} ${path}\n`;
  });
  
  display += '═'.repeat(60) + '\n';
  display += `📊 Total Endpoints: ${routes.length}\n`;
  display += '🌊 Ready to explore the Grand Line! 🌊\n';
  
  return display;
}

/**
 * Display all available endpoints
 * @param {Object} app - Express application instance
 */
function displayEndpoints(app) {
  try {
    const routes = extractRoutes(app);
    const formattedDisplay = formatRoutesForDisplay(routes);
    console.log(formattedDisplay);
  } catch (error) {
    console.log('⚠️  Could not extract routes:', error.message);
  }
}

module.exports = {
  displayEndpoints,
  extractRoutes,
  formatRoutesForDisplay
};
