import {TwingEnvironment, TwingLoaderFilesystem} from 'twing';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as express from 'express';
import {existsSync} from 'fs';
import * as inlineCSS from 'inline-css';
import {join} from 'path';
import {initTwig} from '../../src/common/mailer/adapters/twing.adapter';

const PORT = 1234;
const server = express();

/**
 * Exemples:
 * http://localhost:1234/accountCreatedByOther?groupName=Les%20locavores%20affam%C3%A9s&senderName=Jean-Michel&recipientName=Corentin&link=www.camap.net
 */
server.get('/:template', async ({params: {template}, query}, res) => {
    if (template === 'favicon.ico') return null;
    const exists = existsSync(join(__dirname, "..", `${template}.twig`));
    if (!exists) res.end('Error');

    try {
        const loader = new TwingLoaderFilesystem(join(__dirname, ".."));
        const twing = new TwingEnvironment(loader, {cache: false});

        query.theme = {
            name: 'Nom du thème',
            email: {brandedEmailLayoutFooter: 'testmail'}
        }
        console.log(query);

        initTwig(twing).then(() => {
            return twing
                .render(`${template}.twig`, query)
                .then((output) => {
                    return inlineCSS(output, {url: `file://${join(__dirname, "..")}/`});
                })
                .then((output) => {
                    res.end(output);
                })
                .catch(e => console.log(e));
        });
    } catch
        (e) {
        console.log(e)
    }
})
;

server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Start on http://localhost:${PORT}`);
});
