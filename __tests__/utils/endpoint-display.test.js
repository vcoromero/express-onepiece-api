// Endpoint Display Utility Tests
// These are unit tests for the endpoint display utility

const { displayEndpoints, extractRoutes, formatRoutesForDisplay } = require('../../src/utils/endpoint-display');

describe('Endpoint Display Utility', () => {
  let mockApp;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock console methods to avoid noise
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('extractRoutes', () => {
    it('should extract routes from Express app', () => {
      // Mock Express app structure
      mockApp = {
        _router: {
          stack: [
            {
              route: {
                methods: { get: true },
                path: '/api/health'
              }
            },
            {
              route: {
                methods: { post: true },
                path: '/api/auth/login'
              }
            }
          ]
        }
      };

      const routes = extractRoutes(mockApp);

      expect(routes).toHaveLength(2);
      expect(routes[0]).toEqual({
        method: 'GET',
        path: '/api/health',
        fullPath: '/api/health'
      });
      expect(routes[1]).toEqual({
        method: 'POST',
        path: '/api/auth/login',
        fullPath: '/api/auth/login'
      });
    });

    it('should handle multiple methods for same route', () => {
      mockApp = {
        _router: {
          stack: [
            {
              route: {
                methods: { get: true, post: true, put: true },
                path: '/api/fruits'
              }
            }
          ]
        }
      };

      const routes = extractRoutes(mockApp);

      expect(routes).toHaveLength(1);
      expect(routes[0].method).toBe('GET, POST, PUT');
    });

    it('should handle router middleware', () => {
      mockApp = {
        _router: {
          stack: [
            {
              name: 'router',
              regexp: { source: '^\\/api\\/?$' },
              handle: {
                stack: [
                  {
                    route: {
                      methods: { get: true },
                      path: '/health'
                    }
                  }
                ]
              }
            }
          ]
        }
      };

      const routes = extractRoutes(mockApp);

      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('/api/health');
    });

    it('should handle nested routers', () => {
      mockApp = {
        _router: {
          stack: [
            {
              name: 'router',
              regexp: { source: '^\\/api\\/?$' },
              handle: {
                stack: [
                  {
                    name: 'router',
                    regexp: { source: '^\\/v1\\/?$' },
                    handle: {
                      stack: [
                        {
                          route: {
                            methods: { get: true },
                            path: '/users'
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            }
          ]
        }
      };

      const routes = extractRoutes(mockApp);

      expect(routes).toHaveLength(1);
      expect(routes[0].path).toBe('/api/v1/users');
    });

    it('should return empty array if no routes', () => {
      mockApp = {
        _router: {
          stack: []
        }
      };

      const routes = extractRoutes(mockApp);

      expect(routes).toEqual([]);
    });

    it('should handle app without router', () => {
      mockApp = {};

      const routes = extractRoutes(mockApp);

      expect(routes).toEqual([]);
    });
  });

  describe('formatRoutesForDisplay', () => {
    it('should format routes for display', () => {
      const routes = [
        { method: 'GET', path: '/api/health' },
        { method: 'POST', path: '/api/auth/login' },
        { method: 'GET', path: '/api/fruits' },
        { method: 'POST', path: '/api/fruits' }
      ];

      const formatted = formatRoutesForDisplay(routes);

      expect(formatted).toContain('🌊 ONE PIECE API - Available Endpoints 🌊');
      expect(formatted).toContain('📡 POST                 /api/auth/login');
      expect(formatted).toContain('📡 GET | POST           /api/fruits');
      expect(formatted).toContain('📊 Total Endpoints: 4');
      expect(formatted).toContain('🌊 Ready to explore the Grand Line! 🌊');
    });

    it('should handle empty routes array', () => {
      const formatted = formatRoutesForDisplay([]);

      expect(formatted).toBe('No routes found');
    });

    it('should group routes by path', () => {
      const routes = [
        { method: 'GET', path: '/api/fruits' },
        { method: 'POST', path: '/api/fruits' },
        { method: 'PUT', path: '/api/fruits' },
        { method: 'DELETE', path: '/api/fruits' }
      ];

      const formatted = formatRoutesForDisplay(routes);

      expect(formatted).toContain('📡 GET | POST | PUT | DELETE /api/fruits');
    });

    it('should sort routes by path', () => {
      const routes = [
        { method: 'GET', path: '/api/z' },
        { method: 'GET', path: '/api/a' },
        { method: 'GET', path: '/api/m' }
      ];

      const formatted = formatRoutesForDisplay(routes);

      const lines = formatted.split('\n');
      const routeLines = lines.filter(line => line.includes('📡'));
      
      expect(routeLines[0]).toContain('/api/a');
      expect(routeLines[1]).toContain('/api/m');
      expect(routeLines[2]).toContain('/api/z');
    });
  });

  describe('displayEndpoints', () => {
    it('should display endpoints successfully', () => {
      mockApp = {
        _router: {
          stack: [
            {
              route: {
                methods: { get: true },
                path: '/api/health'
              }
            }
          ]
        }
      };

      const consoleSpy = jest.spyOn(console, 'log');

      displayEndpoints(mockApp);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('🌊 ONE PIECE API - Available Endpoints 🌊')
      );
    });

    it('should handle errors gracefully', () => {
      mockApp = null;

      const consoleSpy = jest.spyOn(console, 'log');

      displayEndpoints(mockApp);

      expect(consoleSpy).toHaveBeenCalledWith(
        '⚠️  Could not extract routes:',
        expect.any(String)
      );
    });

    it('should handle extraction errors', () => {
      // Mock app that will cause an error
      mockApp = {
        _router: {
          stack: null // This will cause an error
        }
      };

      const consoleSpy = jest.spyOn(console, 'log');

      displayEndpoints(mockApp);

      expect(consoleSpy).toHaveBeenCalledWith('No routes found');
    });
  });

  describe('Edge Cases', () => {
    it('should handle routes with special characters', () => {
      mockApp = {
        _router: {
          stack: [
            {
              route: {
                methods: { get: true },
                path: '/api/fruits/:id'
              }
            }
          ]
        }
      };

      const routes = extractRoutes(mockApp);

      expect(routes[0].path).toBe('/api/fruits/:id');
    });

    it('should handle routes with query parameters', () => {
      mockApp = {
        _router: {
          stack: [
            {
              route: {
                methods: { get: true },
                path: '/api/search?q=test'
              }
            }
          ]
        }
      };

      const routes = extractRoutes(mockApp);

      expect(routes[0].path).toBe('/api/search?q=test');
    });

    it('should handle complex router regex patterns', () => {
      mockApp = {
        _router: {
          stack: [
            {
              name: 'router',
              regexp: { source: '^\\/api\\/v1\\/?$' },
              handle: {
                stack: [
                  {
                    route: {
                      methods: { get: true },
                      path: '/users'
                    }
                  }
                ]
              }
            }
          ]
        }
      };

      const routes = extractRoutes(mockApp);

      expect(routes[0].path).toBe('/api/v1/users');
    });
  });
});
