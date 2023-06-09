import { INestApplication } from '@nestjs/common';
import { DatasetGenerators } from '../dataset-generator';
import * as faker from 'faker';

export default async (generators: DatasetGenerators, app: INestApplication) => {
  const group = await generators.genGroup({ name: 'AMAP de ' + faker.address.city() });
  let i = 50;
  while (i > 0) {
    const u = await generators.genUser({});
    await generators.genUserGroup({ userIdOrEntity: u, groupIdOrEntity: group });
    i--;
  }
  return { group };
};