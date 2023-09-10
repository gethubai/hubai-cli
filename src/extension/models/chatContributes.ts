import Joi from 'joi';

export interface IChatCommandCompletionItem {
  label: string;
  insertText: string;
  shortDescription?: string;
  description?: string;
  command?: string;
}

export interface IChatCommandCompletionDefinition {
  path: string;
  language: string;
  values?: IChatCommandCompletionItem[];
}

export interface IChatCommandCompletion {
  [key: string]: IChatCommandCompletionDefinition[];
}

export interface IChatContribute {
  commands: IChatCommandCompletion;
}

export const chatContributeValidationSchema = Joi.object({
  commands: Joi.object()
    .pattern(
      Joi.string()
        .regex(/^[a-zA-Z]+$/)
        .message('Command name can only contain letters')
        .min(2)
        .max(50)
        .required(),
      Joi.array().items(
        Joi.object({
          path: Joi.string()
            .required()
            .regex(/\.json$/) // must end with .json
            .message('Path should be a json'),
          language: Joi.string().required().min(2).max(5),
        })
      )
    )
    .optional(),
});

export const chatCommandCompletionValidationSchema = Joi.object({
  label: Joi.string()
    .regex(/^[a-zA-Z]+$/)
    .message('Label can only contain letters')
    .required()
    .min(2)
    .max(50),
  insertText: Joi.string().required().min(2).max(1200),
  shortDescription: Joi.string().optional().min(2).max(100),
  description: Joi.string().optional().min(2).max(600),
  command: Joi.string()
    .optional()
    .min(2)
    .max(50)
    .regex(/^[a-zA-Z]+$/)
    .message('Command can only contain letters'),
});
