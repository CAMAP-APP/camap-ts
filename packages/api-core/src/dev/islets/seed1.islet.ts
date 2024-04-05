import { INestApplication } from '@nestjs/common';
import { DatasetGenerators } from '../dataset-generator';
import * as faker from 'faker';
import {UserRight} from "../../groups/services/user-groups.service";
import {Unit} from "camap-common";

export default async (generators: DatasetGenerators, app: INestApplication) => {

  const user = await generators.genUser({});
  console.log("create user " + user.email)

  const group = await generators.genGroup({
    name: 'La ferme de la Galinette',
  });
  console.log("create group " + group.name)

  const vendor = await generators.genVendor({
    name: 'La Ferme de la Galinette',
    zipCode: '33200',
    city: 'Galignac',
  });

  const catalog = await generators.genCatalog({
    name: 'Catalogue Oeufs',
    groupIdOrdEntity: group,
    vendorIdOrdEntity: vendor,
  });

  await generators.genUserGroup({
    userIdOrEntity: user,
    groupIdOrEntity: group,
    rights: [
      {
        right: UserRight.catalogAdmin,
        params: [catalog.id.toString()],
      },
    ],
  });

  const products = await Promise.all([
    generators.genProduct({
      name: 'Oeufs',
      qt: 6,
      unitType: Unit.Piece,
      price: 3.0,
      catalogIdOrEntity: catalog,
    }),
    generators.genProduct({
      name: 'Poulet',
      qt: 1.8,
      unitType: Unit.Kilogram,
      price: 22,
      multiWeight: true,
      variablePrice: true,
      catalogIdOrEntity: catalog,
    }),
  ]);

  return { group };
};