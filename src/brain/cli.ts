/* eslint-disable @typescript-eslint/no-floating-promises */
import { Command } from 'commander';
import { packBrain } from './package.js';
import logger from '../logger.js';
import './template.js';
import templateEngine from '../templates/templateEngine.js';
import { TemplateKind } from '../templates/models/template.js';
import { publishPackage } from '../packageRegistry/publish.js';

const brainCommands = [
  new Command('package')
    .description('Generates the .hext package file to install the brain')
    .option('--selfHosted <url>', 'If its a self hosted brain, provide the url')
    .action(async str => {
      if (str.selfHosted)
        logger.info(`Packing self hosted brain to url ${str.selfHosted}`);
      await packBrain({
        entryPointOverride: str.selfHosted
          ? './node_modules/@hubai/brain-sdk/src/services/selfHostedBrain.ts'
          : undefined,
        selfHostedUrl: str.selfHosted,
      });
    }),
  new Command('publish')
    .description('Pack and publishes the brain to the hubai registry')
    .action(async str => {
      if (str.selfHosted)
        logger.info(`Packing self hosted brain to url ${str.selfHosted}`);
      const result = await packBrain({
        entryPointOverride: str.selfHosted
          ? './node_modules/@hubai/brain-sdk/src/services/selfHostedBrain.ts'
          : undefined,
        selfHostedUrl: str.selfHosted,
      });

      if (result.packagePath) {
        await publishPackage({
          packagePath: result.packagePath,
          packageType: 'brain',
        });
      }
    }),
  new Command('create')
    .description('Generates a new brain project')
    .action((str, options) =>
      templateEngine.showPromptForTemplateKind(TemplateKind.Brain)
    ),
];

export default brainCommands;
