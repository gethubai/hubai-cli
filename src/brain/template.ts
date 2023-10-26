import templateEngine from '../templates/templateEngine.js';
import { brainManifestValidationSchema } from './models/brainManifest.js';
import { TemplateKind } from '../templates/models/template.js';
import { validateFromSchema } from '../utils/validationUtils.js';
import logger from '../logger.js';
import { installNpmPackage } from '../utils/npmUtils.js';

templateEngine.addAction('npm-install-brain-sdk', options => {
  logger.info('Installing latest @hubai/brain-sdk package');
  return installNpmPackage(options.targetPath, '@hubai/brain-sdk@latest');
});

templateEngine.addTemplate({
  name: 'brain-ts',
  description: 'Typescript template',
  kind: TemplateKind.Brain,
  path: 'brain/templates/brain-ts',
  postActions: ['npm-install', 'npm-install-brain-sdk'],
  questions: [
    {
      name: 'brainName',
      type: 'input',
      message:
        'Please input the brain name (only string and numbers, max 50 characters)',
      validate: (value: string) =>
        validateFromSchema(brainManifestValidationSchema, 'name', value),
    },
    {
      name: 'description',
      type: 'input',
      message: 'Short description of your brain',
    },
    {
      name: 'displayName',
      type: 'input',
      message: 'The display name of your brain',
      validate: (value: string) =>
        validateFromSchema(brainManifestValidationSchema, 'displayName', value),
    },
    {
      name: 'capabilities',
      type: 'checkbox',
      message: 'Select the capabilities your brain will have',
      choices: [
        {
          name: 'conversation',
          checked: true,
        },
        {
          name: 'voice_transcription',
          checked: false,
        },
        {
          name: 'image_recognition',
          checked: false,
        },
        {
          name: 'image_generation',
          checked: false,
        },
      ],
      validate: value =>
        validateFromSchema(
          brainManifestValidationSchema,
          'capabilities',
          value
        ),
    },
    {
      name: 'publisher',
      type: 'input',
      message: 'Publisher Name (Org. Name)',
      default: 'orgName',
      validate: (value: string) =>
        validateFromSchema(brainManifestValidationSchema, 'publisher', value),
    },
  ],
  skipFiles: [],
});
