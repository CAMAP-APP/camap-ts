const rad = (deg: number) => {
  return deg * (Math.PI / 180);
};

/**
 * This uses the ‘haversine’ formula to calculate the distance between two points.
 * */
// eslint-disable-next-line import/prefer-default-export
export const getDistance = (latitude1: number, latitude2: number, longitude1: number, longitude2: number) => {
  const R = 6378137; // Earth’s mean radius in meter
  const dLat = rad(latitude2 - latitude1);
  const dLong = rad(longitude2 - longitude1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(latitude1)) * Math.cos(rad(latitude2)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d;
};
