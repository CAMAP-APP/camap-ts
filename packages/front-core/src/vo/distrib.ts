import { UserVo, parseUserVo } from './user';

export interface DistribSlotVo {
  id: number;
  distribId: number;
  selectedUserIds: number[];
  registeredUserIds: number[];
  start: Date;
  end: Date;
}

export interface DistribVo {
  id: number;
  start?: Date;
  end?: Date;
  orderEndDate?: Date;
  mode: 'solo-only' | 'default';
  slots?: DistribSlotVo[];
  inNeedUsers?: UserVo[];
}

const parseSlotVo = (data: any): DistribSlotVo => {
  return {
    id: data.id,
    distribId: data.distribId,
    selectedUserIds: data.selectedUserIds,
    registeredUserIds: data.registeredUserIds,
    start: new Date(data.start),
    end: new Date(data.end),
  };
};

export const parseDistribVo = (data: any): DistribVo => {
  return {
    id: data.id,
    mode: data.mode,
    start: data.start ? new Date(data.start) : undefined,
    end: data.end ? new Date(data.end) : undefined,
    orderEndDate: data.orderEndDate ? new Date(data.orderEndDate) : undefined,
    slots: data.slots ? data.slots.map(parseSlotVo) : undefined,
    inNeedUsers: data.slots ? data.inNeedUsers.map(parseUserVo) : undefined,
  };
};
