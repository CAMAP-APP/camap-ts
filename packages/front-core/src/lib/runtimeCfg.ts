// packages/front-core/src/lib/runtimeCfg.ts

type Cfg = Partial<{
  FRONT_URL: string;
  FRONT_GRAPHQL_URL: string;
  CAMAP_BRIDGE_API: string;
  CAMAP_HOST: string;
  PUBLIC_PATH: string;
  MAPBOX_KEY: string;
}>;

declare const __CACHE_KEY__: string;

export function getRuntimeCfg(): Cfg {
  if (typeof window === 'undefined') return {};
  return ((window as any).__APP_CONFIG__ ?? {}) as Cfg;
}

export function getGraphqlUrl(): string {
  const cfg = getRuntimeCfg();
  return cfg.FRONT_GRAPHQL_URL || '/graphql';
}

export function getLocalesLoadPath(): string {
  const cfg = getRuntimeCfg();
  const base = cfg.CAMAP_HOST || '';
  return `${base}/locales/{{lng}}/{{ns}}.json?v=${__CACHE_KEY__}`;
}

export function getMapboxKey(): string | undefined {
  const cfg = getRuntimeCfg();
  return cfg.MAPBOX_KEY;
}

export function getFrontUrl(): string | undefined {
  const cfg = getRuntimeCfg();
  return cfg.FRONT_URL;
}

// Host du site Haxe (web)
export function getCamapHost(): string {
  const cfg = getRuntimeCfg();
  return (cfg.CAMAP_HOST || '').replace(/\/$/, '');
}

// 🔹 Base pour les appels REST "legacy" (catalog, subscription, etc.)
export function getRestBaseUrl(): string {
  const cfg = getRuntimeCfg();
  if (cfg.CAMAP_HOST) {
    return cfg.CAMAP_HOST.replace(/\/$/, '');
  }
  // fallback raisonnable : même origine que la page
  if (typeof window !== 'undefined') {
    return window.location.origin.replace(/\/$/, '');
  }
  return '';
}

// 🔹 Base pour l’API bridge Node si tu veux l’utiliser ailleurs
export function getBridgeApiUrl(): string {
  const cfg = getRuntimeCfg();
  return (cfg.CAMAP_BRIDGE_API || '').replace(/\/$/, '');
}
