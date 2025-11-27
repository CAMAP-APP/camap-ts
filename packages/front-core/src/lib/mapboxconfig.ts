// packages/front-core/src/lib/mapboxConfig.ts
import { getMapboxKey } from './runtimeCfg';

export function requireMapboxKey(): string {
  const key = getMapboxKey();
  if (!key) {
    // Ici tu peux soit :
    // - throw (fail fast)
    // - soit log un warning et retourner une valeur vide
    // Je privilégie un throw clair, ça évite des comportements bizarres.
    // eslint-disable-next-line no-console
    console.error(
      '[Mapbox] MAPBOX_KEY manquante dans window.__APP_CONFIG__.MAPBOX_KEY',
    );
    throw new Error('MAPBOX_KEY is not defined in runtime config');
  }
  return key;
}
