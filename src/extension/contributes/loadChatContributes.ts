import path from 'path';
import fs from 'fs-extra';

import {
  IChatCommandCompletion,
  IChatCommandCompletionItem,
  IChatContribute,
  chatCommandCompletionValidationSchema,
  chatContributeValidationSchema,
} from '../models/chatContributes.js';
import logger from '../../logger.js';
import { IExtensionBuildContext } from '../models/extensionBuildContext.js';

const currentPath = process.cwd();

export async function loadChatContributes(
  buildContext: IExtensionBuildContext
): Promise<boolean> {
  const chatContributes = buildContext.manifest.contributes
    ?.chat as IChatContribute;

  if (!chatContributes) return true;

  const validationResult =
    chatContributeValidationSchema.validate(chatContributes);

  if (validationResult.error) {
    logger.validationError(
      'Chat contributes is invalid',
      validationResult.error
    );
    return false;
  }

  return await validateChatCommands(buildContext, chatContributes?.commands);
}

async function validateChatCommands(
  buildContext: IExtensionBuildContext,
  chatCommands: IChatCommandCompletion | undefined
): Promise<boolean> {
  const result = true;

  if (!chatCommands) return result;

  for (const key in chatCommands) {
    for (const commandEntry of chatCommands[key]) {
      const jsonPath = path.resolve(currentPath, commandEntry.path);

      const json = (await fs.readJson(jsonPath, {
        throws: false,
      })) as IChatCommandCompletionItem[];

      if (!json) {
        throw new Error(`Json file ${jsonPath} not found or invalid`);
      }

      const errors = json
        .map(c => chatCommandCompletionValidationSchema.validate(c).error)
        .filter(e => e);

      if (errors.length > 0) {
        throw errors[0];
      }

      json.forEach(c => {
        // Use description as short description if not provided
        if (!c.shortDescription && c.description) {
          c.shortDescription = c.description.substring(0, 99);
        }
      });

      commandEntry.values = json;

      buildContext.copyToBuildOutput(commandEntry.path);
    }
  }

  return result;
}
