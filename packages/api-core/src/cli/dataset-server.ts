import { INestApplication } from '@nestjs/common';
import * as cors from 'cors';
import * as express from 'express';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { datasetGenerators } from '../dev/dataset-generator';
import { initNest } from './utils';

const parseRefreshQuery = (req: express.Request) => {
  if (req.query.refresh === undefined) return false;
  if (req.query.refresh === 'false' || req.query.refresh === '0') return false;
  return true;
};

(async () => {
  const app = await initNest({ withDefaultLogger: true });
  const generators = await datasetGenerators(app as INestApplication);

  const appExpress = express();
  appExpress.use(cors());
  appExpress.use(express.json({ limit: '25mb' }));

  appExpress.get('/islets/:isletName', async (req, res) => {
    const ilsetName = req.params.isletName;
    const refresh = parseRefreshQuery(req);

    if (!ilsetName) {
      throw new Error('no param isletName');
    }

    console.log(`gen ${ilsetName}`);

    const cacheFilePath = join(__dirname, `../../.dataset-cache/${ilsetName}.json`);

    if (!refresh) {
      let cached = existsSync(cacheFilePath)
        ? JSON.parse(readFileSync(cacheFilePath, { encoding: 'utf-8' }))
        : undefined;

      if (cached) {
        console.log(`send ${ilsetName} from cache`);
        res.send(cached);
        return;
      }
    }

    const isletFile = join(__dirname, `../../dist/dev/islets/${ilsetName}.islet.js`);
    if (!existsSync(isletFile)) {
      throw new Error(`no ${ilsetName}`);
    }
    const islet = await require(isletFile).default(generators, app);
    writeFileSync(cacheFilePath, JSON.stringify(islet));
    console.log(`send ${ilsetName}`);
    res.send(islet);
  });

  appExpress.post('/islets/:isletName', async (req, res) => {
    const ilsetName = req.params.isletName;

    if (!ilsetName) {
      throw new Error('no param isletName');
    }

    console.log(`post ${ilsetName}`);

    const isletFile = join(__dirname, `../../dist/dev/islets/${ilsetName}.islet.js`);
    if (!existsSync(isletFile)) {
      throw new Error(`no ${ilsetName}`);
    }

    const islet = await require(isletFile).default(generators, app, req.body);
    console.log(`post ${ilsetName}`);
    res.send(islet);
  });

  appExpress.listen(6007, () => {
    console.log('start @6007');
  });
})();
