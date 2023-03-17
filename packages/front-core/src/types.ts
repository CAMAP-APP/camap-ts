import { Theme } from 'camap-common';

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

declare global {
  interface Window {
    // Haxe JS app
    _Camap: {
      addTmpBasketIdToSession: (tmpBasketId?: number) => void;
      resetGroupInSession: (deletedGroupId?: number) => void;
      theme: Theme;
    };
    // GTM data layer
    dataLayer: any[];
  }
}

// eslint-disable-next-line no-underscore-dangle
window._Camap = window._Camap || {};

window.dataLayer = window.dataLayer || [];
