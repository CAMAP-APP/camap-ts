import React from 'react';
import { MultiDistrib } from '../../gql';
import useRestLazyGet from '../../lib/REST/useRestLazyGetApi';
import useRestPostApi from '../../lib/REST/useRestPostApi';

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
	hasVolunteerRole: Record<string, boolean>;
	volunteerForRole: Record<string, Volunteer | null>;
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

export const useRestUnsubscribeFromRole = (distribId: number, roleId: number) => {
  const url = React.useMemo(
    () => `/distributions/unsubscribeFromRole/${distribId}/${roleId}`,
    [distribId, roleId],
  );
  return useRestPostApi<{ success: boolean }, Record<string, never>>(url);
};
