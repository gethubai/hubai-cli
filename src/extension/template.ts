import shell from 'shelljs';
import templateEngine from '../templates/templateEngine.js';
import { TemplateKind } from '../templates/models/template.js';
import { validateFromSchema } from '../utils/validationUtils.js';
import { extensionManifestValidationSchema } from './models/extensionManifest.js';
import logger from '../logger.js';

templateEngine.addAction('npm-install-hubai-core', options => {
  logger.info('Installing latest @hubai/core package');

  return new Promise((resolve, reject) => {
    shell.cd(options.targetPath);

    shell.exec(
      'npm install @hubai/core@latest',
      { silent: false, stdio: 'inherit', async: true } as any,
      code => {
        if (code !== 0) {
          logger.error(
            'Could not install latest @hubai/core package, try installing it manually: npm install @hubai/core@latest'
          );
          reject('Could not install latest @hubai/core package');
          shell.exit(1);
        } else {
          logger.success('Latest @hubai/core package installed');
          resolve();
        }
      }
    );
  });
});

templateEngine.addTemplate({
  name: 'empty-extension-ts',
  description: 'Empty extension template using typescript',
  kind: TemplateKind.Extension,
  path: 'extension/templates/empty-ts',
  postActions: ['npm-install', 'npm-install-hubai-core'],
  questions: [
    {
      name: 'extensionName',
      type: 'input',
      message:
        'Please input the extension name (only string and numbers, max 50 characters)',
      validate: (value: string) =>
        validateFromSchema(extensionManifestValidationSchema, 'name', value),
    },
    {
      name: 'description',
      type: 'input',
      message: 'Description of your extension',
    },
    {
      name: 'displayName',
      type: 'input',
      message: 'The display name of your extension',
      validate: (value: string) =>
        validateFromSchema(
          extensionManifestValidationSchema,
          'displayName',
          value
        ),
    },
    {
      name: 'extensionKind',
      type: 'checkbox',
      message: 'Select the kinds of your extension',
      choices: [
        {
          name: 'Workbench (UI)',
          value: 'workbench',
          checked: true,
        },
        {
          name: 'Themes',
          value: 'Themes', // should be uppercase
          checked: false,
        },
        {
          name: 'Settings (Add to settings)',
          value: 'settings',
          checked: false,
        },
        {
          name: 'Translation',
          value: 'locales',
          checked: false,
        },
        {
          name: 'Menus',
          value: 'menus',
          checked: false,
        },
      ],
      validate: value =>
        validateFromSchema(
          extensionManifestValidationSchema,
          'extensionKind',
          value
        ),
    },
    {
      name: 'publisher',
      type: 'input',
      message: 'Publisher Name (Org. Name)',
      default: 'orgName',
      validate: (value: string) =>
        validateFromSchema(
          extensionManifestValidationSchema,
          'publisher',
          value
        ),
    },
  ],
  skipFiles: [],
});

templateEngine.addTemplate({
  name: 'todo-list-ts',
  description: 'An example of a todo list extension using typescript',
  kind: TemplateKind.Extension,
  path: 'extension/templates/todo-list-ts',
  postActions: ['npm-install', 'npm-install-hubai-core'],
  questions: [],
  skipFiles: [],
});

templateEngine.addTemplate({
  name: 'light-theme-ts',
  description: 'An example of a light theme extension using typescript',
  kind: TemplateKind.Extension,
  path: 'extension/templates/light-theme-ts',
  postActions: ['npm-install', 'npm-install-hubai-core'],
  questions: [],
  skipFiles: [],
});
