const express = require('express');
const {
  extractRoutes,
  formatRoutesForDisplay,
  displayEndpoints
} = require('../../src/utils/endpoint-display');

describe('endpoint-display utility', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.get('/api/health', (req, res) => res.json({ status: 'OK' }));
    app.post('/api/characters', (req, res) => res.json({}));
    app.get('/api/characters/:id', (req, res) => res.json({}));
  });

  describe('extractRoutes', () => {
    it('returns an array of routes', () => {
      const routes = extractRoutes(app);
      expect(Array.isArray(routes)).toBe(true);
      expect(routes.length).toBeGreaterThan(0);
    });

    it('each route has method and path properties', () => {
      const routes = extractRoutes(app);
      routes.forEach((route) => {
        expect(route).toHaveProperty('method');
        expect(route).toHaveProperty('path');
      });
    });

    it('returns empty array for app with no routes', () => {
      const emptyApp = express();
      const routes = extractRoutes(emptyApp);
      expect(routes).toEqual([]);
    });

    it('extracts routes from mounted routers', () => {
      const routerApp = express();
      const router = express.Router();
      router.get('/races', (req, res) => res.json({}));
      router.post('/races', (req, res) => res.json({}));
      routerApp.use('/api', router);

      const routes = extractRoutes(routerApp);

      expect(Array.isArray(routes)).toBe(true);
      expect(routes.length).toBeGreaterThan(0);
      const paths = routes.map((r) => r.path);
      expect(paths.some((p) => p.includes('races'))).toBe(true);
    });

    it('handles router layers without a stack', () => {
      const appWithLayerNoStack = express();
      appWithLayerNoStack.use('/api', (req, res, next) => next());

      expect(() => extractRoutes(appWithLayerNoStack)).not.toThrow();
    });
  });

  describe('formatRoutesForDisplay', () => {
    it('returns a string', () => {
      const routes = extractRoutes(app);
      const display = formatRoutesForDisplay(routes);
      expect(typeof display).toBe('string');
    });

    it('returns fallback message when routes array is empty', () => {
      const display = formatRoutesForDisplay([]);
      expect(display).toBe('No routes found');
    });

    it('contains route paths in the output', () => {
      const routes = extractRoutes(app);
      const display = formatRoutesForDisplay(routes);
      expect(display).toContain('/api/health');
    });

    it('includes total endpoints count in output', () => {
      const routes = extractRoutes(app);
      const display = formatRoutesForDisplay(routes);
      expect(display).toContain('Total Endpoints');
    });
  });

  describe('displayEndpoints', () => {
    it('does not throw when called with a valid Express app', () => {
      expect(() => displayEndpoints(app)).not.toThrow();
    });

    it('handles errors gracefully when app._router is missing', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const badApp = {
        _router: {
          stack: [
            {
              route: null,
              name: 'router',
              regexp: /test/,
              handle: null
            }
          ]
        }
      };

      expect(() => displayEndpoints(badApp)).not.toThrow();
      consoleSpy.mockRestore();
    });
  });
});
