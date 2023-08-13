/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-empty-interface */
import { build } from 'esbuild';
import fs from 'fs-extra';
import archiver from 'archiver';
import path from 'path';
import { replace } from 'esbuild-plugin-replace';
import { LocalBrainSettingMap } from './models/settingMap.js';
import Joi from 'joi';
import logger from '../logger.js';
import { fileURLToPath } from 'url';
import {
  IBrainManifest,
  brainManifestValidationSchema,
} from './models/brainManifest.js';
import { readJsonFromPath } from '../utils/jsonUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type PackBrainOptions = {
  entryPointOverride?: string;
  selfHostedUrl?: string;
};

export function buildManifest(packageJson: any): IBrainManifest | undefined {
  try {
    if (!packageJson.brain) {
      throw new Error('brain section not found in package.json');
    }

    const manifest = {
      name: packageJson.brain.name,
      displayName: packageJson.brain.displayName,
      version: packageJson.version,
      description: packageJson.brain.description,
      entryPoint: packageJson.main,
      capabilities: packageJson.brain.capabilities,
      settingsMap: packageJson.brain.settingsMap?.map(
        (setting: any) =>
          new LocalBrainSettingMap(
            setting.name,
            setting.displayName,
            setting.type,
            setting.required,
            setting.defaultValue,
            setting.enumValues,
            setting.description,
            setting.scope
          )
      ),
      publisher: packageJson.publisher,
      repositoryUrl: packageJson.repository?.url,
      minimumEngineVersion: packageJson.engines?.hubai,
      icon: packageJson.icon,
      tags: packageJson.keywords,
      homepage: packageJson.homepage,
      bugs: packageJson.bugs,
      categories: packageJson.categories,
    } as IBrainManifest;

    validateManifest(manifest);
    return manifest;
  } catch (error) {
    if (error instanceof Joi.ValidationError) {
      logger.validationError('Could not validate manifest', error);
    } else {
      logger.error('Error building manifest', error);
    }
    return undefined;
  }
}

export function validateManifest(manifest: IBrainManifest): void {
  if (!manifest)
    throw new Error('Manifest is null. Please check your package.json file');

  const { error } = brainManifestValidationSchema.validate(manifest);
  if (error) {
    throw error;
  }
}

export function copyIfExist(src: string, dest: string): void {
  if (fs.existsSync(src)) {
    fs.copySync(src, dest);
  }
}

export type IBrainPackageResult = {
  error?: Error;
  packagePath?: string;
};

export async function packBrain({
  entryPointOverride,
  selfHostedUrl,
}: PackBrainOptions): Promise<IBrainPackageResult> {
  return new Promise<IBrainPackageResult>(async (resolve, reject) => {
    try {
      const currentPath = process.cwd();
      const packageJsonPath = path.resolve(currentPath, 'package.json');
      const packageJson = readJsonFromPath(packageJsonPath);

      if (!packageJson) {
        throw new Error('package.json not found');
      }

      const manifest = buildManifest(packageJson);
      if (!manifest) return;

      // Determine the entry point
      const entryPoint = entryPointOverride ?? manifest.entryPoint;

      // Create a temporary directory
      const tempDir = path.resolve(__dirname, 'temp');

      if (fs.existsSync(tempDir)) {
        fs.removeSync(tempDir); // delete old build
      }

      fs.ensureDirSync(tempDir);

      const outFilePath = path.resolve(tempDir, 'src/main.js');

      const buildPlugins = [];

      if (selfHostedUrl) {
        buildPlugins.push(replace({ __SELF_HOSTED_URL__: selfHostedUrl }));
        logger.debug(`Replacing __SELF_HOSTED_URL__ with ${selfHostedUrl}`);
      }

      // Build using esbuild
      const buildResult = await build({
        entryPoints: [entryPoint],
        outfile: outFilePath,
        bundle: true,
        platform: 'node',
        plugins: buildPlugins,
      });

      if (buildResult.errors.length > 0) {
        throw new Error('Build failed:\n' + buildResult.errors.join('\n'));
      }

      if (buildResult.warnings.length > 0) {
        logger.warn('Build warnings:\n' + buildResult.warnings.join('\n'));
      } else {
        logger.success('Build succeeded with no warnings');
      }

      await fs.writeJSON(path.resolve(tempDir, 'manifest.json'), manifest);

      copyIfExist(
        path.resolve(currentPath, 'README.md'),
        path.resolve(tempDir, 'README.md')
      );

      copyIfExist(
        path.resolve(currentPath, 'LICENSE'),
        path.resolve(tempDir, 'LICENSE')
      );

      copyIfExist(
        path.resolve(currentPath, 'CHANGELOG.MD'),
        path.resolve(tempDir, 'CHANGELOG.MD')
      );

      if (packageJson.icon) {
        copyIfExist(
          path.resolve(currentPath, packageJson.icon),
          path.resolve(tempDir, packageJson.icon)
        );
      }

      // Copy package.json to temp directory
      fs.copySync(packageJsonPath, path.resolve(tempDir, 'package.json'));

      // build the manifest
      const outPackageName = `${packageJson.name ?? 'brain'}.hext`;

      // Zip the files
      const output = fs.createWriteStream(
        path.resolve(currentPath, outPackageName)
      );

      const archive = archiver('zip', {
        zlib: { level: 9 }, // Sets the compression level
      });
      output.on('close', () => {
        logger.debug('Manifest:', manifest);
        logger.success(
          'Brain successfully packed to: ' +
            path.join(currentPath, outPackageName)
        );

        resolve({
          packagePath: path.resolve(currentPath, outPackageName),
        });
      });
      archive.pipe(output);
      archive.directory(tempDir, false);
      await archive.finalize();
    } catch (error) {
      logger.error('Error packing brain', error);
      resolve({ error: error as any });
    }
  });
}
