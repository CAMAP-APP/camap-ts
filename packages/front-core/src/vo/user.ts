export interface UserData {
  id: number;

  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;

  address1: string | null;
  address2: string | null;
  zipCode: string | null;
  city: string | null;

  nationality: string | null;
  countryOfResidence: string | null;

  birthDate: string | null;

  firstName2: string | null;
  lastName2: string | null;
  email2: string | null;
  phone2: string | null;
}

export interface UserVo {
  id: number;

  firstName: string;
  lastName: string;
  email: string;
  phone?: string;

  address1?: string;
  address2?: string;
  zipCode?: string;
  city?: string;

  nationality?: string;
  countryOfResidence?: string;

  birthDate?: string;

  firstName2?: string;
  lastName2?: string;
  email2?: string;
  phone2?: string;
}

export const parseUserVo = (data: UserData): UserVo => ({
  id: data.id,

  firstName: data.firstName,
  lastName: data.lastName,
  email: data.email,
  phone: data.phone || undefined,

  address1: data.address1 || undefined,
  address2: data.address2 || undefined,
  zipCode: data.zipCode || undefined,
  city: data.city || undefined,

  nationality: data.nationality || undefined,
  countryOfResidence: data.countryOfResidence || undefined,

  birthDate: data.birthDate || undefined,

  firstName2: data.firstName2 || undefined,
  lastName2: data.lastName2 || undefined,
  email2: data.email2 || undefined,
  phone2: data.phone2 || undefined,
});

export const formatUserAddress = (user: UserVo): string | undefined => {
  let res = '';
  if (!user.city && !user.zipCode) return undefined;

  if (user.city) res = user.city;
  if (user.zipCode) res = `${res} (${user.zipCode})`;

  if (user.address1) res = `${user.address1} - ${res}`;

  return res;
};
