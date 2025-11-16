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
  // Préfère CAMAP_HOST, sinon chemin relatif
  const base = cfg.CAMAP_HOST || '';
  return `${base}/locales/{{lng}}/{{ns}}.json`;
}

// MAPBOX: lu AU RUNTIME via __APP_CONFIG__
// (plus de process.env.MAPBOX_KEY dans le front)
export function getMapboxKey(): string | undefined {
  const cfg = getRuntimeCfg();
  return cfg.MAPBOX_KEY;
}

// Optionnel : helper générique pour FRONT_URL si besoin ailleurs
export function getFrontUrl(): string | undefined {
  const cfg = getRuntimeCfg();
  return cfg.FRONT_URL;
}
