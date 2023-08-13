import Joi from 'joi';
import { IManifest, manifestValidationSchema } from '../../models/manifest.js';

export interface IBrainManifest extends IManifest {
  capabilities: string[];
}

export const brainManifestValidationSchema = manifestValidationSchema.concat(
  Joi.object({
    capabilities: Joi.array()
      .items(Joi.string().required())
      .unique()
      .required(),
  })
);
