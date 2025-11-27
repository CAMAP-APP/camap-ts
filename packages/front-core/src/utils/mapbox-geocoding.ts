import {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
} from 'geojson';
import { getMapboxKey } from '../lib/runtimeCfg';

export type MapBoxFeature<
  G extends Geometry | null = Geometry,
  P = GeoJsonProperties,
> = Feature<G, P> & {
  place_name: string;
  place_name_fr: string;
};

export type MapBoxFeatureCollection<
  G extends Geometry | null = Geometry,
  P = GeoJsonProperties,
> = FeatureCollection<G, P> & {
  features: Array<MapBoxFeature<G, P>>;
};

const GEOCODING_COUNTRIES =
  'fr%2Cbe%2Cre%2Cnc%2Cgp%2Cgy%2Cmq%2Cyt%2Cbl%2Cmf%2Cpf%2Cpm%2Cwf';

export const places = async (
  accessToken: string,
  request: string,
): Promise<MapBoxFeatureCollection> => {
  const params = {
    access_token: accessToken,
    country: GEOCODING_COUNTRIES,
    language: 'fr',
    autocomplete: 'true',
  };

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${request}.json?${Object.entries(
    params,
  )
    .map(([key, value]) => `${key}=${value}`)
    .join('&')}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(res.statusText);
  return (await res.json()) as MapBoxFeatureCollection;
};

export const reverse = async (
  accessToken: string,
  lng: number,
  lat: number,
): Promise<MapBoxFeatureCollection> => {
  const params = {
    access_token: accessToken,
    language: 'fr',
  };

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?${Object.entries(
    params,
  )
    .map(([key, value]) => `${key}=${value}`)
    .join('&')}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(res.statusText);
  return (await res.json()) as MapBoxFeatureCollection;
};

/**
 * Fabrique un client Mapbox.
 * - Si token explicite fourni, on l'utilise.
 * - Sinon, on lit MAPBOX_KEY dans la config runtime (__APP_CONFIG__ via getMapboxKey()).
 */
const mapboxApi = (token?: string) => {
  const accessToken = token || getMapboxKey();
  if (!accessToken) {
    throw new Error(
      'mapboxApi requires an accessToken (MAPBOX_KEY is not set in runtime config)',
    );
  }

  return {
    places: (request: string) => places(accessToken, request),
    reverse: (lng: number, lat: number) => reverse(accessToken, lng, lat),
  };
};

export default mapboxApi;
