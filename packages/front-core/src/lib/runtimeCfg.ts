// packages/front-core/src/lib/runtimeCfg.ts
type Cfg = Partial<{
  FRONT_URL: string;
  FRONT_GRAPHQL_URL: string;
  CAMAP_BRIDGE_API: string;
}>;

export function getRuntimeCfg(): Cfg {
  if (typeof window === 'undefined') return {};
  return ((window as any).__APP_CONFIG__ ?? {}) as Cfg;
}

export function getGraphqlUrl(): string {
  const cfg = getRuntimeCfg();
  // 1) privilégie FRONT_GRAPHQL_URL (ex: https://api.devcamap.amap44.org/graphql)
  // 2) fallback relatif /graphql (proxifié par Apache vers nest-devcamap:3010)
  return cfg.FRONT_GRAPHQL_URL || '/graphql';
}

export function getLocalesLoadPath(): string {
  const cfg = getRuntimeCfg();
  // 1) si FRONT_URL défini, on l’utilise comme base
  // 2) sinon fallback relatif (proxifié par Apache vers nest-devcamap:3010)
  const base = cfg.FRONT_URL || '';
  return `${base}/locales/{{lng}}/{{ns}}.json`;
}
