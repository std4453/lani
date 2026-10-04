import { hsluvToHex } from 'hsluv';
import { ResolvedTheme } from './settings';

export function tagColors(hue: number, theme: ResolvedTheme) {
  const dark = theme === 'dark';
  return {
    '--tag-border-color': hsluvToHex([hue, dark ? 45 : 80, dark ? 40 : 80]),
    '--tag-hover-border-color': hsluvToHex([
      hue,
      dark ? 65 : 90,
      dark ? 60 : 65,
    ]),
    '--tag-color': hsluvToHex([hue, 65, dark ? 75 : 50]),
    '--tag-hover-color': hsluvToHex([hue, 90, dark ? 85 : 30]),
    '--tag-bg-color': hsluvToHex([hue, dark ? 40 : 65, dark ? 16 : 96]),
    '--tag-hover-bg-color': hsluvToHex([hue, 50, dark ? 24 : 90]),
  };
}
