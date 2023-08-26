import { Command } from 'commander';
import path from 'path';
import { fileURLToPath } from 'url';

import logger from './logger.js';
import brainCommands from './brain/cli.js';
import extensionCommands from './extension/cli.js';
import { readJsonFromPath } from './utils/jsonUtils.js';
import './templates/templateActions.js';
import authCommands from './auth/cli.js';
import publisherCommands from './publisher/cli.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const packageJson = readJsonFromPath(path.join(__dirname, '../package.json'));
const version: string = packageJson.version;

const program = new Command();

const brainCli = program.command('brain').description('Brain commands');
brainCommands.forEach(command => brainCli.addCommand(command));

const extensionCli = program
  .command('extension')
  .description('Extension commands');

extensionCommands.forEach(command => extensionCli.addCommand(command));

const authCli = program.command('auth').description('Authentication commands');
authCommands.forEach(command => authCli.addCommand(command));

const publisherCli = program
  .command('publisher')
  .description('Publisher management commands');
publisherCommands.forEach(command => publisherCli.addCommand(command));

program
  .version(version)
  .name('hubai')
  .option('-d, --debug', 'enables verbose logging', false)
  .parse(process.argv);

if (program.opts().debug) {
  logger.enableVerbose();
}

logger.debug('Running with options', program.opts());
