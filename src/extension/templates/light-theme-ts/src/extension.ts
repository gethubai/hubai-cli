import { IExtension } from '@hubai/core';

const config = require('../package.json');
const lightThemeExtension: IExtension = {
  name: config.name,
  version: config.version,
  main: config.main,
  author: config.author,
  ...config.extension,
};

export default lightThemeExtension;
