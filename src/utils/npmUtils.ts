import shell from 'shelljs';
import logger from '../logger.js';

export function installNpmPackage(
  pathToInstall: string,
  packageName: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    shell.cd(pathToInstall);

    const command = `npm install ${packageName}`;

    shell.exec(
      command,
      { silent: false, stdio: 'inherit', async: true } as any,
      code => {
        if (code !== 0) {
          logger.error(
            `Could not install ${packageName} package, try installing it manually: ${command}`
          );
          reject(`Command ${command} failed`);
          shell.exit(1);
        } else {
          logger.success(`Package ${packageName} has been installed`);
          resolve();
        }
      }
    );
  });
}
