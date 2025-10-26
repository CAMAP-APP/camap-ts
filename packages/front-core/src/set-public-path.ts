// packages/api-core/src/set-public-path.ts
(function () {
  const w = window as any;
  const cfg = w.__APP_CONFIG__ || {};
  const base = (cfg.PUBLIC_PATH || (location.origin + '/neostatic/')) as string;
  // @ts-ignore - global du runtime webpack
  __webpack_require__.p = base.endsWith('/') ? base : base + '/';
})();
