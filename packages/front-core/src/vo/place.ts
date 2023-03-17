export interface PlaceVo {
  id: number;
  name: string;
  address1?: string;
  address2?: string;
  city?: string;
  zipCode?: string;
  lat?: number;
  lng?: number;
}

export const parsePlaceVo = (data: any): PlaceVo => {
  return {
    id: data.id,
    name: data.name,
    address1: data.address1 ? data.address1 : undefined,
    address2: data.address2 ? data.address2 : undefined,
    city: data.city ? data.city : undefined,
    zipCode: data.zipCode ? data.zipCode : undefined,
    lat: data.lat ? data.lat : undefined,
    lng: data.lng ? data.lng : undefined,
  };
};
