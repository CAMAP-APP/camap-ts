import { TwingEnvironment, TwingLoaderFilesystem } from 'twing';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as express from 'express';
import { existsSync } from 'fs';
import * as inlineCSS from 'inline-css';
import { join } from 'path';
import { clean, runSass, copyTwigs, conf } from './utils';
import { initTwig } from '../../src/common/mailer/adapters/twing.adapter';

const PORT = 1234;
const server = express();

clean();
runSass(true);
copyTwigs(true);

server.get('/:template', async ({ params: { template }, query }, res) => {
  if (template === 'favicon.ico') return null;
  const exists = existsSync(join(conf.DIST_DIR, `${template}.twig`));
  if (!exists) res.end('Error');

  const loader = new TwingLoaderFilesystem(conf.DIST_DIR);
  const twing = new TwingEnvironment(loader, { cache: false });

  console.log(query);

  initTwig(twing).then(() => {
    return twing
      .render(`${template}.twig`, query)
      .then((output) => {
        return inlineCSS(output, { url: `file://${conf.DIST_DIR}/` });
      })
      .then((output) => {
        res.end(output);
      });
  });
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Start on http://localhost:${PORT}`);
});
