import Joi from 'joi';
import { SettingMap } from '../../models/settingMap.js';

export enum BrainSettingScope {
  //  Settings that apply to all instances of the app and can only be configured in user settings.
  // This is the default scope.
  APPLICATION = 'application',
  // Settings that can be configured in user settings and in the chat window.
  CHAT_OVERRIDABLE = 'chat_overridable',
}

export class LocalBrainSettingMap extends SettingMap {
  scope: BrainSettingScope;
  /* Specify which brain_capability this configuration applies to (leave empty for all) */
  capabilities?: string[] = [];

  static validationSchema = Joi.object({
    scope: Joi.string().valid('application', 'chat_overridable').optional(),
    capabilities: Joi.array()
      .items(Joi.string().required())
      .unique()
      .optional(),
  });

  constructor(
    name: string,
    displayName: string,
    type: string,
    required?: boolean,
    defaultValue?: string,
    enumValues?: string[],
    description?: string,
    isSecret?: boolean,
    scope?: string,
    capabilities?: string[]
  ) {
    super(
      name,
      displayName,
      type,
      required,
      defaultValue,
      enumValues,
      description,
      isSecret
    );

    const { error } = LocalBrainSettingMap.validationSchema.validate({ scope });

    if (error) {
      throw error;
    }

    this.scope = scope
      ? this.parseBrainSettingScope(scope)
      : BrainSettingScope.APPLICATION;
    this.capabilities = capabilities;
  }

  parseBrainSettingScope(scopeString: string): BrainSettingScope {
    switch (scopeString) {
      case 'application':
        return BrainSettingScope.APPLICATION;
      case 'chat_overridable':
        return BrainSettingScope.CHAT_OVERRIDABLE;
      default:
        throw new Error(`Invalid BrainSettingScope: ${scopeString}`);
    }
  }
}
