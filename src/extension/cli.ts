import { Command } from 'commander';
import { packExtension } from './package.js';
import './template.js';
import templateEngine from '../templates/templateEngine.js';
import { TemplateKind } from '../templates/models/template.js';
import { publishPackage } from '../packageRegistry/publish.js';

const extensionCommands = [
  new Command('package')
    .description('Generates the .hext package file to install the extension')
    .action(async () => {
      await packExtension();
    }),

  new Command('publish')
    .description('Pack and publishes the extension to the hubai registry')
    .action(async str => {
      const result = await packExtension();

      if (result.packagePath) {
        await publishPackage({
          packagePath: result.packagePath,
          packageType: 'extension',
        });
      }
    }),

  new Command('create')
    .description('Generates a new extension project')
    .action((str, options) =>
      templateEngine.showPromptForTemplateKind(TemplateKind.Extension)
    ),
];

export default extensionCommands;
