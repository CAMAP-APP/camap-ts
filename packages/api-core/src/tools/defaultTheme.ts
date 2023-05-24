import { Theme } from 'camap-common';

const DEFAULT_THEME = (host: string): Theme => ({
  id: 'default',
  name: 'CAMAP',
  supportEmail: 'inter@amap44.org',
  email: {
    senderEmail: 'noreply@camap.amap44.org',
    brandedEmailLayoutFooter: `<p>CAMAP - INTERAMAP44, 1 Boulevard Boulay-Paty 44100 Nantes</p>
    <div style="display: flex; justify-content: center; align-items: center;">
        <a href="https://camap.alilo.fr" target="_blank" rel="noreferrer noopener notrack" class="bold-green" style="text-decoration:none !important; padding: 8px; display: flex; align-items: center;">
            <img src="${host}/img/emails/website.png" alt="Site web" height="25" style="width:auto!important; height:25px!important; vertical-align:middle;" valign="middle" width="auto"/>Site web
        </a>
        <a href="https://www.facebook.com/groups/camap44" target="_blank" rel="noreferrer noopener notrack" class="bold-green" style="text-decoration:none !important; padding: 8px; display: flex; align-items: center;">
            <img src="${host}/img/emails/facebook.png" alt="Facebook" height="25" style="width:auto!important; height:25px!important; vertical-align:middle;" valign="middle" width="auto"/>Facebook
        </a>
    </div>`,
  },
  terms: {
    termsOfServiceLink: 'https://amap44.org/cgu/',
    termsOfSaleLink: 'https://amap44.org/cgu/',
    platformTermsLink: 'https://amap44.org/cgu/',
  },
});

export default DEFAULT_THEME;
