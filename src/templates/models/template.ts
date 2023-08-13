/* eslint-disable @typescript-eslint/no-floating-promises */
import { QuestionCollection } from 'inquirer';

export enum TemplateKind {
  Brain = 'brain',
  Extension = 'extension',
}

export interface ITemplate {
  name: string;
  description: string;
  kind: TemplateKind;
  questions: QuestionCollection;
  path: string;
  skipFiles: string[];
  postActions?: string[];
  postProcess?: (options: any) => void;
}
