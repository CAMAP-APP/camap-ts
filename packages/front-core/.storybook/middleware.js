const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function expressMiddleware(router) {
  router.use(
    '/graphql',
    createProxyMiddleware({
      target: 'http://localhost:3010/graphql',
      changeOrigin: true,
    }),
  );
  router.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost',
      changeOrigin: true,
    }),
  );
};
