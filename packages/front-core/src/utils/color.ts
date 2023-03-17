export const rgba = (color: string, alpha: number) => {
  if (color.startsWith('#')) {
    let hex = color.replace('#', '');
    if (hex.length === 3) {
      hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
    }

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `rgba(${r},${g},${b},${alpha})`;
  } else if (color.startsWith('rgb(')) {
    const rgb = color.match(/\d+/g);
    if (!rgb) return null;
    return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
  }

  return null;
};
