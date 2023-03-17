export function getCookie(cookieName: string) {
  const cookies = document.cookie ? document.cookie.split('; ') : [];
  const record: Record<string, string> = {};
  for (let i = 0; i < cookies.length; i++) {
    const parts = cookies[i].split('=');
    let value = parts.slice(1).join('=');

    try {
      const found = decodeURIComponent(parts[0]);
      if (value[0] === '"') {
        value = value.slice(1, -1);
      }
      record[found] = value.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);

      if (cookieName === found) {
        break;
      }
    } catch (e) {}
  }

  return record[cookieName];
}

export function setCookie(cookieName: string, value: string) {
  cookieName = encodeURIComponent(cookieName)
    .replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
    .replace(/[()]/g, escape);

  return (document.cookie =
    cookieName +
    '=' +
    encodeURIComponent(value).replace(
      /%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,
      decodeURIComponent,
    ));
}
