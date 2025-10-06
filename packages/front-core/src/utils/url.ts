/* eslint-disable no-useless-escape */

export const URL_PATTERN =
  /([A-Za-z]{3,9}:(?:\/\/)?(?:[\-;:&=\+\$,\w]+)?[A-Za-z0-9\.\-]+|(?:www\.)[A-Za-z0-9\.\-]+)(?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%\.\w_]*)#?(?:[\.\!\/\\\w]*)?/;
export const FINISHED_URL_PATTERN =
  /([A-Za-z]{3,9}:(?:\/\/)?(?:[\-;:&=\+\$,\w]+)?[A-Za-z0-9\.\-]+|(?:www\.)[A-Za-z0-9\.\-]+)(?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%\.\w_]*)#?(?:[\.\!\/\\\w]*)?\s/;
export const isUrl = (text: string) => {
  return URL_PATTERN.test(text);
};
export const isFinishedUrl = (text: string) => {
  return FINISHED_URL_PATTERN.test(text);
};

export const goTo = (
  url: string,
  { inNewTab }: { inNewTab?: boolean } = {},
) => {
  if (process.env.NODE_ENV === 'production') {
    if (inNewTab) {
      window.open(url, '_blank');
    } else {
      window.location.href = url;
    }
  } else {
    if(window.confirm(`[DEV] Redirect to ${url}`)) {
      if (inNewTab) {
        window.open(url, '_blank');
      } else {
        window.location.href = url;
      }
    }
  }
};
