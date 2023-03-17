export interface GeoAutocompleteOptionType {
  id: string;
  place_name: string;
  geometry: {
    coordinates: number[];
  };
}
