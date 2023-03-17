export interface Theme {
  id: string; // theme's id
  name: string; // readable name
  supportEmail: string; // email address of the support
  footer?: {
    bloc1?: string; // first footer bloc in html
    bloc2?: string; // second footer bloc in html
    bloc3?: string; // third footer bloc in html
    bloc4?: string; // last footer bloc in html
  };
  email: {
    senderEmail: string;
    brandedEmailLayoutFooter: string; // footer of the branded email layout in html
  };
  terms: {
    termsOfServiceLink: string;
    termsOfSaleLink: string;
    platformTermsLink: string;
  };
}
