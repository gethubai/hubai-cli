import Joi from 'joi';

export interface IThemeContributes {
  /**
   * The id of component, theme will be applied by this ID
   */
  id: string;
  label: string;
  name?: string;
  uiTheme?: string;
  path: string;
  description?: string;
  type?: string;
  colors?: any;
  tokenColors?: any[];
  /**
   * The semanticTokenColors mappings as well as
   * the semanticHighlighting setting
   * allow to enhance the highlighting in the editor
   * More info visit: https://code.visualstudio.com/api/language-extensions/semantic-highlight-guide
   */
  semanticHighlighting?: boolean;
}

export const themeContributesValidationSchema = Joi.array()
  .items(
    Joi.object({
      id: Joi.string().required().min(2).max(20),
      label: Joi.string().required().min(2).max(50),
      uiTheme: Joi.string().optional().valid('hubai', 'hubai-dark', 'hc-black'),
      path: Joi.string()
        .required()
        .regex(/\.json$/) // must end with .json
        .message('Path should be a json'),
      description: Joi.string().optional().min(2).max(600),
      type: Joi.string().optional().valid('dark', 'light', 'hc'),
    })
  )
  .optional();
