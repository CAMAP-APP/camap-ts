import { GroupPreviewMap, Place } from '../../gql';

export type GroupOnMap = Pick<
  GroupPreviewMap,
  'id' | 'name' | 'image' | 'placeId'
> & {
  place: Pick<
    Place,
    'id' | 'name' | 'lat' | 'lng' | 'address1' | 'address2' | 'zipCode' | 'city'
  >;
};
