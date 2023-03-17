import Bowser from 'bowser';

declare global {
  interface Window { 
    IsValidBrowser: boolean ;
  }
}

const COMPATIBLE_BROWSERS = {
  safari: '>=10',
  android: '>=79',
  samsung_internet: '>=6.4',
  chrome: '>=49',
  chromium: '>=49',
  firefox: '>=52',
  edge: '>=14',
  opera: '>=36',
};
const browser = Bowser.getParser(window.navigator.userAgent);
const isValidBrowser = browser.satisfies(COMPATIBLE_BROWSERS);
window.IsValidBrowser = isValidBrowser;
