import { Command } from 'commander';
import logger from '../logger.js';
import { createPublisher } from './create.js';
import { listPublishers } from './list.js';

const publisherCommands = [
  new Command('create')
    .description('Creates a new HubAI publisher')
    .option('--name <name>', 'Publisher name (Required)')
    .option('--displayName <displayName>', 'Publisher display name (Required)')
    .action(async options => {
      if (!options.name || !options.displayName) {
        logger.error('Please provide a name and a display name');
        return;
      }

      logger.info('Creating publisher ', options.name);

      await createPublisher({
        name: options.name,
        displayName: options.displayName,
      });
    }),

  new Command('list')
    .description('Lists all HubAI publishers created by you')
    .action(async () => {
      await listPublishers();
    }),
];

export default publisherCommands;
