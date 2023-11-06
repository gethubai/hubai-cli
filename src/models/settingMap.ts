import Joi from 'joi';

export enum SettingType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  INTEGER = 'integer',
}

export interface ISettingMap {
  name: string;

  displayName: string;

  type: SettingType;

  enumValues?: string[];

  defaultValue?: string;

  required: boolean;

  description?: string;
  isSecret?: boolean;
}

export class SettingMap implements ISettingMap {
  static validationSchema = Joi.object({
    name: Joi.string()
      .regex(/^[a-zA-Z0-9-_]+$/)
      .trim()
      .min(2)
      .max(50)
      .required(),
    displayName: Joi.string().trim().min(2).max(50).required(),
    type: Joi.string()
      .valid('string', 'number', 'boolean', 'integer')
      .required(),
    required: Joi.boolean().optional(),
    defaultValue: Joi.alternatives()
      .conditional('type', { is: 'number', then: Joi.number() })
      .conditional('type', { is: 'boolean', then: Joi.boolean() })
      .conditional('type', { is: 'integer', then: Joi.number().integer() })
      .conditional('type', { is: 'string', then: Joi.string() })
      .optional(),
    enumValues: Joi.array()
      .items(Joi.string().trim().min(1).max(60))
      .when('type', { is: 'string', otherwise: Joi.forbidden() }),
    description: Joi.string().optional(),
    isSecret: Joi.boolean().optional(),
  }).id('ISettingMap');
  name: string;

  displayName: string;

  type: SettingType;

  enumValues?: string[];

  defaultValue?: string;

  required: boolean;

  description?: string;
  isSecret?: boolean;

  constructor(
    name: string,
    displayName: string,
    type: string,
    required?: boolean,
    defaultValue?: string,
    enumValues?: string[],
    description?: string,
    isSecret?: boolean
  ) {
    const { error } = SettingMap.validationSchema.validate({
      name,
      displayName,
      type,
      required,
      defaultValue,
      enumValues,
      description,
      isSecret,
    });

    if (error) {
      throw error;
    }

    this.name = name;
    this.displayName = displayName;
    this.type = this.parseSettingType(type);
    this.defaultValue = defaultValue;
    this.enumValues = enumValues;
    this.required = required === undefined ? false : required;
    this.description = description;
    this.isSecret = isSecret;
  }

  parseSettingType(typeString: string): SettingType {
    switch (typeString) {
      case 'string':
        return SettingType.STRING;
      case 'number':
        return SettingType.NUMBER;
      case 'boolean':
        return SettingType.BOOLEAN;
      case 'integer':
        return SettingType.INTEGER;
      default:
        throw new Error(`Invalid SettingType: ${typeString}`);
    }
  }
}
