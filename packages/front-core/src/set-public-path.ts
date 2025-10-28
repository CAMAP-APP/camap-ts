// packages/api-core/src/set-public-path.ts
declare global {
  // déclaration minimale du runtime webpack
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const __webpack_require__: { p: string } | undefined;
}

(function () {
  if (typeof window === "undefined") return; // garde SSR/tests

  const w = window as unknown as { __APP_CONFIG__?: Record<string, unknown> };
  const cfg = (w.__APP_CONFIG__ ?? {}) as Record<string, unknown>;

  const fromEnv = typeof cfg.PUBLIC_PATH === "string" ? (cfg.PUBLIC_PATH as string) : undefined;
  const fallback = `${location.origin}/neostatic/`;

  let base = fromEnv && fromEnv.trim().length > 0 ? fromEnv : fallback;
  if (!base.endsWith("/")) base += "/";

  // Webpack runtime global (Webpack 5)
  if (typeof __webpack_require__ !== "undefined") {
    __webpack_require__.p = base;
  }
})();
