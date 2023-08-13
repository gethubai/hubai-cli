import { IColorTheme, IExtension } from '@hubai/core';

const config = require('../package.json');
const lightThemeExtension: IExtension = {
  name: config.name,
  version: config.version,
  main: config.main,
  author: config.author,
  ...config.extension,
};
const themeOneColors: IColorTheme = require('./themes/github-plus-theme.json');
const themeOne = (lightThemeExtension.contributes?.themes ?? [])[0];

if (lightThemeExtension.contributes?.themes)
  lightThemeExtension.contributes.themes[0] = {
    ...themeOne,
    ...themeOneColors,
  };

export default lightThemeExtension;
