import { UserVo, UserData, parseUserVo } from './user';

export interface GroupPreviewData {
  id: number;
  name: string;
}

export interface GroupData extends GroupPreviewData {
  iban: string | null;
  user: UserData | null;
}

export interface GroupPreviewVo {
  id: number;
  name: string;
}

export interface GroupVo extends GroupPreviewVo {
  iban?: string;
  user?: UserVo;
}

export const parseGroupPreviewVo = (data: GroupPreviewData): GroupPreviewVo => ({
  id: data.id,
  name: data.name,
});

export const parseGroupVo = (data: GroupData): GroupVo => {
  return {
    ...parseGroupPreviewVo(data),
    iban: data.iban || undefined,
    user: data.user ? parseUserVo(data.user) : undefined,
  };
};
