import { INestApplication } from '@nestjs/common';
import * as program from 'commander';
import { existsSync } from 'fs';
import { join } from 'path';
import { createConnection } from 'typeorm';
import { datasetGenerators } from '../dev/dataset-generator';
import { initNest } from './utils';

const cleanDB = async () => {
  const connection = await createConnection();
  await connection.synchronize(true);
  await connection.close();
};

const parseData = (data: any, k?: string) => {
  return Object.entries(data).map(([key, value]: [string, any]) => {
    if (Array.isArray(value)) {
      return parseData(value, `${k ? `${key}-` : ''}${key}`);
    }
    const res = { key: k || key, id: value.id };
    if (typeof value === 'object' && 'email' in value) {
      res['email'] = value.email;
    }
    return res;
  });
};

(async () => {
  program.arguments('islet').option('-c, --clean').option('--noFail');

  program.parse(process.argv);

  if (program.args.length < 1) {
    throw new Error('need an islet name');
  }
  const [ilsetName] = program.args;
  const { clean, noFail } = program.opts();

  let isletFile = join(__dirname, `../../dist/dev/islets/${ilsetName}.islet.js`);
  const isletExists = existsSync(isletFile);
  if (!isletExists) {
    if (noFail) {
      isletFile = join(__dirname, `../../dist/dev/islets/default.islet.js`);
    } else {
      throw new Error(`unknown islet: ${ilsetName}`);
    }
  }

  if (clean) {
    console.log('clean db');
    await cleanDB();
  }

  const app = await initNest({ withDefaultLogger: false });

  const generators = await datasetGenerators(app as INestApplication);
  const data = await require(isletFile).default(generators, app);

  console.log(parseData(data));

  await app.close();
})();
