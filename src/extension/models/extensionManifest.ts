import Joi from 'joi';
import { IManifest, manifestValidationSchema } from '../../models/manifest.js';

export interface IExtensionManifest extends IManifest {
  contributes?: any;
  extensionKind: string[];
}

export const extensionManifestValidationSchema =
  manifestValidationSchema.concat(
    Joi.object({
      contributes: Joi.object(),
      extensionKind: Joi.array().items(Joi.string().required()).required(),
    })
  );
