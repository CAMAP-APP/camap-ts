import { Theme } from 'camap-common';

const DEFAULT_THEME = (host: string): Theme => ({
  id: 'default',
  name: 'CAMAP',
  supportEmail: 'support@cagette.net',
  email: {
    senderEmail: 'noreply@mj.cagette.net',
    brandedEmailLayoutFooter: `<p>CAMAP - ALILO SCOP, 4 impasse Durban, 33000 Bordeaux</p>
    <div style="display: flex; justify-content: center; align-items: center;">	
        <a href="https://camap.alilo.fr" target="_blank" rel="noreferrer noopener notrack" class="bold-green" style="text-decoration:none !important; padding: 8px; display: flex; align-items: center;">
            <img src="${host}/img/emails/website.png" alt="Site web" height="25" style="width:auto!important; height:25px!important; vertical-align:middle;" valign="middle" width="auto"/>Site web
        </a>
        <a href="https://www.facebook.com/cagette" target="_blank" rel="noreferrer noopener notrack" class="bold-green" style="text-decoration:none !important; padding: 8px; display: flex; align-items: center;">
            <img src="${host}/img/emails/facebook.png" alt="Facebook" height="25" style="width:auto!important; height:25px!important; vertical-align:middle;" valign="middle" width="auto"/>Facebook
        </a>
        <a href="https://www.youtube.com/channel/UC3cvGxAUrbN9oSZmr1oZEaw" target="_blank" rel="noreferrer noopener notrack" class="bold-green" style="text-decoration:none !important; padding: 8px; display: flex; align-items: center;">
            <img src="${host}/img/emails/youtube.png" alt="YouTube" height="25" style="width:auto!important; height:25px!important; vertical-align:middle;" valign="middle" width="auto"/>YouTube
        </a>
    </div>`,
  },
  terms: {
    termsOfServiceLink:
      'https://www.cagette.net/wp-content/uploads/2020/11/cgu-.pdf',
    termsOfSaleLink: 'https://www.cagette.net/wp-content/uploads/2020/11/cgv.pdf',
    platformTermsLink: '',
  },
});

export default DEFAULT_THEME;
