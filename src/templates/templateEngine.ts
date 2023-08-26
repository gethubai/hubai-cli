/* eslint-disable @typescript-eslint/no-floating-promises */
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import { ITemplate, TemplateKind } from './models/template.js';
import logger from '../logger.js';
import { render } from './renderEngine.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CURR_DIR = process.cwd();

export type TemplateOptions = {
  projectName: string;
  templateName: string;
  templatePath: string;
  targetPath: string;
  [key: string]: any;
};

export class TemplateEngine {
  private templates: ITemplate[];
  private actions: Record<
    string,
    (options: TemplateOptions, template: ITemplate) => Promise<void> | void
  >;

  constructor() {
    this.templates = [];
    this.actions = {};
  }

  showPromptForTemplateKind(kind: TemplateKind): void {
    const templates = this.getTemplates(kind);

    if (templates.length === 0) {
      logger.error(`No templates found for kind ${kind}`);
    } else {
      inquirer
        .prompt([
          {
            name: 'template',
            type: 'list',
            message: 'What template would you like to use?',
            choices: templates.map(template => ({
              name: `${template.name}: ${template.description}`,
              value: template.name,
            })),
          },
        ])
        .then(answers => {
          this.executeTemplate(answers['template']);
        });
    }
  }

  addAction(
    actionName: string,
    action: (
      options: TemplateOptions,
      template: ITemplate
    ) => Promise<void> | void
  ): void {
    this.actions[actionName] = action;
  }

  addTemplate(template: ITemplate): void {
    this.templates.push(template);
  }

  getTemplates(kind?: TemplateKind): ITemplate[] {
    const templates = this.templates;
    if (kind) {
      return templates.filter(template => template.kind === kind);
    }
    return templates;
  }

  getTemplate(templateName: string): ITemplate {
    const template = this.templates.find(
      template => template.name === templateName
    );

    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }

    return template;
  }

  executeTemplate(templateName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const template = this.getTemplate(templateName);
      const questions = [
        ...[
          {
            name: 'projectName',
            type: 'input',
            message: 'Please input the project name',
            validate: (input: string) => {
              if (!input)
                return 'You need to provide a project name. Please try again.';

              if (!/^([A-Za-z\-_\d])+$/.test(input))
                return 'Project name may only include letters, numbers, underscores and hashes.';

              return true;
            },
          },
        ],
        ...(template.questions as any),
      ];

      inquirer.prompt(questions).then(async answers => {
        const projectName = answers['projectName'];
        //@ts-ignore
        const templatePath = path.join(__dirname, '../../src/', template.path);

        //@ts-ignore
        const targetPath = path.join(CURR_DIR, projectName);

        const options = {
          ...answers,
          //@ts-ignore
          projectName,
          //@ts-ignore
          templateName: template.name,
          templatePath,
          targetPath: targetPath,
        } as TemplateOptions;

        logger.debug('Template options:', options);

        this.createProject(targetPath);

        //@ts-ignore
        this.createDirectoryContents(template, options);

        logger.info('Project created successfully!');

        if (template.postActions) {
          for (const actionName of template.postActions) {
            if (this.actions[actionName])
              await this.actions[actionName](options, template);
            else logger.error(`Action ${actionName} not found`);
          }
        }

        if (template.postProcess) template.postProcess(options);

        resolve();
      });
    });
  }

  createProject(projectPath: string): void {
    if (fs.existsSync(projectPath)) {
      throw new Error('Project path already exists');
    } else {
      logger.info('Creating the project path..');
      fs.mkdirSync(projectPath);
    }
  }

  createDirectoryContents(
    template: ITemplate,
    templateOptions: TemplateOptions
  ): void {
    const { templatePath, projectName } = templateOptions;
    // read all files/folders (1 level) from template folder
    const filesToCreate = fs.readdirSync(templatePath);
    // loop each file/folder
    filesToCreate.forEach(file => {
      const origFilePath = path.join(templatePath, file);

      // get stats about the current file
      const stats = fs.statSync(origFilePath);

      // skip files that should not be copied
      if (template.skipFiles.indexOf(file) > -1) return;

      const filePath = path.join(CURR_DIR, projectName, file);

      if (stats.isFile()) {
        // read file content and transform it using template engine
        let contents = fs.readFileSync(origFilePath, 'utf8');
        contents = render(contents, templateOptions);
        // write file to destination folder
        fs.writeFileSync(filePath, contents, 'utf8');
      } else if (stats.isDirectory()) {
        if (!fs.existsSync(filePath)) {
          // create folder in destination folder
          fs.mkdirSync(filePath);
        }

        // copy files/folder inside current folder recursively
        this.createDirectoryContents(template, {
          ...templateOptions,
          templatePath: origFilePath,
          projectName: path.join(projectName, file),
        });
      }
    });
  }
}

const templateEngine = new TemplateEngine();
export default templateEngine;
