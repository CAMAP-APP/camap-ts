import React from 'react';
import { MultiDistrib } from '../../gql';
import useRestLazyGet from '../../lib/REST/useRestLazyGetApi';

type Volunteer = {
  id: number;
  coupleName: string;
};

export type RestCsaMultiDistribWithVolunteerRoles = Pick<
  MultiDistrib,
  'distribStartDate' | 'id'
> & {
  hasVacantVolunteerRoles: boolean;
  canVolunteersJoin: boolean;
  volunteersRequired: number;
  volunteersRegistered: number;
  hasVolunteerRole: Map<number, boolean>;
  volunteerForRole: Map<number, Volunteer | null>;
};

export type RestCsaVolunteerRoles = {
  id: number;
  name: string;
};

export const useRestVolunteerMultiDistribsLazyGet = () => {
  const url = React.useMemo(() => `/distributions/volunteerRolesCalendar/`, []);
  return useRestLazyGet<{
    multiDistribs: RestCsaMultiDistribWithVolunteerRoles[];
    roles: RestCsaVolunteerRoles[];
  }>(url);
};
