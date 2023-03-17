import DialogMap from './DialogMap';

export const Default = ({ lat, long }: { lat: number; long: number }) => {
  const place = {
    address1: 'Adresse 1',
    address2: 'Adresse 2',
    city: 'St Martin de la Camap',
    id: 4307,
    latitude: lat,
    longitude: long,
    name: 'Place du marché',
    zipCode: '01000',
  };
  // @ts-ignore
  return <DialogMap place={place} onClose={() => {}} />;
};

Default.args = {
  lat: 46.227638,
  long: 2.213749,
};

export default {
  title: 'components/utils/DialogMap',
  component: DialogMap,
};
