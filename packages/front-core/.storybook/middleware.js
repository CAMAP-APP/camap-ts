const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function expressMiddleware(router) {
  router.use(
    '/graphql',
    createProxyMiddleware({
      target: 'https://api.camap.localdomain/graphql',
      changeOrigin: true,
    }),
  );
  router.use(
    '/api',
    createProxyMiddleware({
      target: 'https://camap.localdomain',
      changeOrigin: true,
    }),
  );
};
