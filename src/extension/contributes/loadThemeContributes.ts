import path from 'path';
import fs from 'fs-extra';
import logger from '../../logger.js';
import { IExtensionBuildContext } from '../models/extensionBuildContext.js';
import {
  IThemeContributes,
  themeContributesValidationSchema,
} from '../models/themeContributes.js';
const currentPath = process.cwd();

export async function loadThemeContributes(
  buildContext: IExtensionBuildContext
): Promise<boolean> {
  const themeContributes: IThemeContributes[] =
    buildContext.manifest.contributes?.themes;

  if (!themeContributes) return true;

  const validationResult =
    themeContributesValidationSchema.validate(themeContributes);

  if (validationResult.error) {
    logger.validationError(
      'Theme contributes is invalid',
      validationResult.error
    );
    return false;
  }

  return await validateThemes(buildContext, themeContributes);
}

async function validateThemes(
  buildContext: IExtensionBuildContext,
  themes: IThemeContributes[]
): Promise<boolean> {
  for (const theme of themes) {
    const themePath = path.resolve(currentPath, theme.path);
    const json = (await fs.readJson(themePath, {
      throws: false,
    })) as IThemeContributes;
    if (!json) {
      throw new Error(`Json file ${themePath} not found or invalid`);
    }

    theme.colors = json.colors;
    theme.tokenColors = json.tokenColors;
    theme.semanticHighlighting = json.semanticHighlighting;
    theme.type = theme.type || json.type;

    // TODO: Add validation for colors and tokenColors

    buildContext.copyToBuildOutput(theme.path);
  }

  return true;
}
