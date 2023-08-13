import shell from 'shelljs';
import fs from 'fs';
import path from 'path';
import templateEngine, { TemplateOptions } from './templateEngine.js';
import logger from '../logger.js';

/* Execute npm install */
templateEngine.addAction('npm-install', async (options: TemplateOptions) => {
  logger.info('Running npm install');
  return new Promise((resolve, reject) => {
    const isNode = fs.existsSync(path.join(options.targetPath, 'package.json'));
    if (isNode) {
      shell.cd(options.targetPath);

      shell.exec(
        'npm install',
        { silent: false, stdio: 'inherit', async: true } as any,
        code => {
          if (code !== 0) {
            logger.error('npm install failed');
            reject('npm install failed');
            shell.exit(1);
          } else {
            logger.success('npm install completed');
            resolve();
          }
        }
      );
    } else {
      logger.warn('No package.json found, skipping npm install');
    }
  });
});
