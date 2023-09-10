import { IExtensionManifest } from './extensionManifest.js';

export interface IExtensionBuildContext {
  extensionPath: string;
  buildOutputPath: string;
  manifest: IExtensionManifest;
  copyIfExists: (from: string, to: string, throwOnNotFound?: boolean) => void;
  copyToBuildOutput: (
    fromExtensionRelativePath: string,
    toBuildOutputRelativePath?: string
  ) => void;
  getExtensionPath: (relativePath: string) => string;
  getBuildOutputPath: (relativePath: string) => string;
}
