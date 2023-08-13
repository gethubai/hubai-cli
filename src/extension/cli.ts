import { Command } from 'commander';
import { packExtension } from './package.js';
import './template.js';
import templateEngine from '../templates/templateEngine.js';
import { TemplateKind } from '../templates/models/template.js';

const extensionCommands = [
  new Command('package')
    .description('Generates the .hext package file to install the extension')
    .action(packExtension),
  new Command('create')
    .description('Generates a new extension project')
    .action((str, options) =>
      templateEngine.showPromptForTemplateKind(TemplateKind.Extension)
    ),
];

export default extensionCommands;
