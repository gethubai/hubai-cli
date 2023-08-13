import fs from 'fs';
import logger from '../logger.js';

export function readJsonFromPath(path: string): any {
  const rawdata = fs.readFileSync(path);
  if (!rawdata) {
    logger.error(`Could not read JSON file from path ${path}`);
  } else {
    return JSON.parse(rawdata as any);
  }
}
