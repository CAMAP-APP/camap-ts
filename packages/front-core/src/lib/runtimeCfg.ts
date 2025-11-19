// packages/front-core/src/lib/runtimeCfg.ts

type Cfg = Partial<{
  FRONT_URL: string;
  FRONT_GRAPHQL_URL: string;
  CAMAP_BRIDGE_API: string;
  CAMAP_HOST: string;
  PUBLIC_PATH: string;
  MAPBOX_KEY: string;
}>;

export function getRuntimeCfg(): Cfg {
  if (typeof window === 'undefined') return {};
  return ((window as any).__APP_CONFIG__ ?? {}) as Cfg;
}

export function getGraphqlUrl(): string {
  const cfg = getRuntimeCfg();
  // 1) privilégie FRONT_GRAPHQL_URL (ex: https://api.camapdev.amap44.org/graphql)
  // 2) fallback relatif /graphql (proxifié par Apache/Nginx vers l’API Nest)
  return cfg.FRONT_GRAPHQL_URL || '/graphql';
}

export function getLocalesLoadPath(): string {
  const cfg = getRuntimeCfg();
  const base = cfg.CAMAP_HOST || '';
  return `${base}/locales/{{lng}}/{{ns}}.json`;
}

export function getMapboxKey(): string | undefined {
  const cfg = getRuntimeCfg();
  return cfg.MAPBOX_KEY;
}

export function getFrontUrl(): string | undefined {
  const cfg = getRuntimeCfg();
  return cfg.FRONT_URL;
}

// 🔹 Nouveau : CAMAP_HOST “nu”
export function getCamapHost(): string {
  const cfg = getRuntimeCfg();
  return cfg.CAMAP_HOST || '';
}

// 🔹 Nouveau : URL de l’API “bridge” (fallback sur CAMAP_HOST + /api)
export function getBridgeApiUrl(): string {
  const cfg = getRuntimeCfg();
  if (cfg.CAMAP_BRIDGE_API) return cfg.CAMAP_BRIDGE_API;
  const base = cfg.CAMAP_HOST || '';
  return `${base}/api`;
}
