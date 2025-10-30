import GroupMap from '@components/map/GroupMap';

export interface GroupMapProps {
  initLat?: number;
  initLng?: number;
  initAddress?: string;
}

const GroupMapModule = (props: GroupMapProps) => {
  return <GroupMap {...props} />
}
export default GroupMapModule;
