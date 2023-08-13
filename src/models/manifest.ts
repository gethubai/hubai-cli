import Joi from 'joi';
import { ISettingMap } from './settingMap.js';

export interface IManifest {
  name: string;
  displayName: string;
  version: string;
  description?: string;
  entryPoint: string;
  settingsMap?: ISettingMap[];
  publisher: string;
  repositoryUrl?: string;
  homepage?: string;
  bugs?: { url?: string; email?: string };
  icon?: string;
  minimumEngineVersion: string;
  categories?: string[];
  tags: string[];
}

export const manifestValidationSchema = Joi.object({
  name: Joi.string()
    .trim()
    .regex(/^[a-zA-Z0-9_]+$/)
    .message('Name can only contain letters, numbers and underscores')
    .min(2)
    .max(50)
    .required(),
  displayName: Joi.string().trim().min(2).max(50).required(),
  version: Joi.string().trim().min(2).max(50).required(),
  description: Joi.string().optional(),
  entryPoint: Joi.string().trim().min(2).max(50).required(),
  settingsMap: Joi.array().optional(),
  publisher: Joi.string().trim().min(2).max(50).required(),
  homepage: Joi.string().uri().optional(),
  bugs: Joi.object({
    url: Joi.string().uri().optional(),
    email: Joi.string().email().optional(),
  }).optional(),
  repositoryUrl: Joi.string().uri().optional(),
  icon: Joi.string().min(2).max(600).optional(),
  minimumEngineVersion: Joi.string().trim().min(2).max(50).required(),
  categories: Joi.array()
    .items(Joi.string().required().min(2).max(50))
    .optional(),
  tags: Joi.array().items(Joi.string().required().min(2).max(50)).min(1).max(5),
});
