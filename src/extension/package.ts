/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-empty-interface */
import fs from 'fs-extra';
import archiver from 'archiver';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import Joi from 'joi';
import webpack from 'webpack';
import logger from '../logger.js';
import { SettingMap } from '../models/settingMap.js';
const { ModuleFederationPlugin } = webpack.container;
import { fileURLToPath } from 'url';
import { readJsonFromPath } from '../utils/jsonUtils.js';
import {
  IExtensionManifest,
  extensionManifestValidationSchema,
} from './models/extensionManifest.js';
import { IExtensionBuildContext } from './models/extensionBuildContext.js';
import { loadChatContributes } from './contributes/loadChatContributes.js';
import { loadThemeContributes } from './contributes/loadThemeContributes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function buildManifest(
  packageJson: any
): IExtensionManifest | undefined {
  try {
    if (!packageJson.extension) {
      throw new Error('extension section not found in package.json');
    }

    const manifest = {
      name: packageJson.extension.name,
      displayName: packageJson.extension.displayName,
      version: packageJson.version,
      description: packageJson.extension.description,
      entryPoint: packageJson.main,
      settingsMap: packageJson.extension.settingsMap?.map(
        (setting: any) =>
          new SettingMap(
            setting.name,
            setting.displayName,
            setting.type,
            setting.required,
            setting.defaultValue,
            setting.enumValues,
            setting.description
          )
      ),
      extensionKind: packageJson.extension.extensionKind,
      contributes: packageJson.extension.contributes,
      publisher: packageJson.publisher,
      repositoryUrl: packageJson.repository?.url,
      icon: packageJson.icon,
      minimumEngineVersion: packageJson.engines?.hubai,
      tags: packageJson.keywords,
      homepage: packageJson.homepage,
      bugs: packageJson.bugs,
      categories: packageJson.categories,
    } as IExtensionManifest;

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

export function validateManifest(manifest: IExtensionManifest): void {
  if (!manifest)
    throw new Error('Manifest is null. Please check your package.json file');

  const { error } = extensionManifestValidationSchema.validate(manifest);
  if (error) {
    throw error;
  }
}

export function copyIfExist(
  src: string,
  dest: string,
  throwOnNotFound = false
): void {
  const exists = fs.existsSync(src);

  if (exists) {
    fs.copySync(src, dest);
  } else if (throwOnNotFound) {
    throw new Error(`File ${src} not found`);
  }
}

export function webpackBuild(
  packageJson: any,
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const currentPath = process.cwd();
      const { name, dependencies } = packageJson;

      const federationConfig = {
        name: name,
        filename: 'remoteEntry.js',
        library: { type: 'module' },
        remotes: {},
        exposes: { './Module': './src/remote-entry.ts' },
        shared: {
          ...dependencies,
          '@hubai/core': {
            singleton: true,
            requiredVersion: dependencies['@hubai/core'],
          },
        },
      };

      if (dependencies.react) {
        federationConfig.shared.react = {
          singleton: true,
          requiredVersion: dependencies.react,
        };
      }

      if (dependencies['react-dom']) {
        federationConfig.shared['react-dom'] = {
          singleton: true,
          requiredVersion: dependencies['react-dom'],
        };
      }

      logger.debug('Federation config', federationConfig);

      const webpackOptions = {
        entry: path.join(currentPath, packageJson.main),
        mode: 'production',
        devtool: 'cheap-source-map',
        cache: false,
        optimization: {
          minimize: true,
        },
        output: {
          path: outputPath,
          publicPath: 'auto',
          scriptType: 'module',
          libraryTarget: undefined,
          filename: '[name].[contenthash:20].js',
          chunkFilename: '[name].[chunkhash:20].js',
          hashFunction: 'xxhash64',
          pathinfo: false,
          crossOriginLoading: false,
          uniqueName: `extension-${name}`,
        },
        experiments: { outputModule: true },
        module: {
          rules: [
            {
              test: /\.(js|ts)x?$/, // add |ts
              exclude: /node_modules/,
              use: {
                loader: 'babel-loader',
                options: {
                  presets: [
                    '@babel/preset-typescript',
                    ['@babel/preset-env'],
                    '@babel/preset-react',
                  ],
                },
              },
            },
            {
              test: /\.(css|less)$/,
              use: ['style-loader', 'css-loader'],
            },
          ],
        },
        plugins: [
          new ModuleFederationPlugin(federationConfig),
          new HtmlWebpackPlugin({
            template: 'public/index.html',
            title: 'Extension',
            filename: 'index.html',
            chunks: ['main'],
          }),
        ],
        resolve: {
          extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
        },
        target: 'web',
        devServer: {
          static: {
            directory: outputPath,
          },
        },
      };

      //logger.debug('Webpack options', webpackOptions);

      const compiler = webpack(webpackOptions as any);

      compiler.run((err, stats) => {
        if (err) {
          // Handle fatal webpack error (configuration error, etc.)
          logger.error('Webpack fatal error:', err);
          reject(err);
          return;
        }

        if (stats?.hasErrors()) {
          // Handle compilation errors
          const errors = stats?.compilation.errors;
          errors?.forEach(error => {
            logger.error('Webpack compilation error:', error.toString());
          });
          reject(new Error('Compilation errors occurred'));
          return;
        }

        if (stats?.hasWarnings()) {
          // Handle compilation warnings
          const warnings = stats?.compilation.warnings;
          warnings?.forEach(warning => {
            logger.warn('Webpack compilation warning:', warning.toString());
          });
        }

        // Log build statistics and assets sizes
        logger.info('Webpack build completed successfully:');
        logger.info(
          stats?.toString({
            colors: true, // Colorful output
            chunks: false, // Do not display chunk information
            modules: false, // Do not display module information
            assets: true, // Display asset information
            warnings: true, // Display warnings
            errors: true, // Display errors
            entrypoints: false, // Do not display entry points information
          })
        );

        resolve();

        compiler.close(closeErr => {
          if (closeErr) {
            logger.error('Error closing compiler:', closeErr);
          }
        });
      });
    } catch (error) {
      logger.error('Error building extension', error);
      reject(error);
    }
  });
}

export type IPackageResult = {
  error?: Error;
  packagePath?: string;
};

export async function packExtension(): Promise<IPackageResult> {
  return new Promise<IPackageResult>(async (resolve, reject) => {
    try {
      const currentPath = process.cwd();
      const packageJsonPath = path.resolve(currentPath, 'package.json');
      const packageJson = readJsonFromPath(packageJsonPath);

      if (!packageJson) {
        throw new Error('package.json not found');
      }

      const manifest = buildManifest(packageJson);
      if (!manifest) return;

      // Create a temporary directory
      const tempDir = path.resolve(__dirname, 'temp');

      if (fs.existsSync(tempDir)) {
        fs.removeSync(tempDir); // delete old build
      }

      fs.ensureDirSync(tempDir);

      fs.ensureDirSync(path.resolve(tempDir, 'src'));

      const buildContext = {
        extensionPath: currentPath,
        buildOutputPath: tempDir,
        manifest,
        getExtensionPath: (relativePath: string) =>
          path.resolve(currentPath, relativePath),
        getBuildOutputPath: (relativePath: string) =>
          path.resolve(tempDir, relativePath),
        copyToBuildOutput: (
          fromExtensionRelativePath: string,
          toBuildOutputRelativePath?: string
        ) => {
          copyIfExist(
            path.resolve(currentPath, fromExtensionRelativePath),
            path.resolve(
              tempDir,
              toBuildOutputRelativePath ?? fromExtensionRelativePath
            )
          );
        },
      } as IExtensionBuildContext;

      const chatContributesResult = await loadChatContributes(buildContext);

      if (!chatContributesResult) {
        throw new Error('Chat contributes load failed');
      }

      const themeContributesResult = await loadThemeContributes(buildContext);
      if (!themeContributesResult) {
        throw new Error('Theme contributes load failed');
      }

      // Build using webpack
      await webpackBuild(packageJson, path.join(tempDir, 'src'));

      await fs.writeJSON(
        buildContext.getBuildOutputPath('manifest.json'),
        buildContext.manifest
      );

      buildContext.copyToBuildOutput('README.md');
      buildContext.copyToBuildOutput('LICENSE');
      buildContext.copyToBuildOutput('CHANGELOG.MD');

      if (packageJson.icon) {
        buildContext.copyToBuildOutput(packageJson.icon);
      }

      buildContext.copyToBuildOutput('package.json');

      // build the manifest
      const outPackageName = `${packageJson.name ?? 'extension'}.hext`;

      // Zip the files
      const output = fs.createWriteStream(
        path.resolve(currentPath, outPackageName)
      );

      const archive = archiver('zip', {
        zlib: { level: 9 }, // Sets the compression level
      });
      output.on('close', () => {
        logger.info('Manifest:', manifest);
        logger.success('Extension successfully packed: ' + outPackageName);
        resolve({ packagePath: path.resolve(currentPath, outPackageName) });
      });
      archive.pipe(output);
      archive.directory(tempDir, false);
      await archive.finalize();
    } catch (error) {
      logger.error('Error packing extension', error);
      reject({ error: error as any });
    }
  });
}
