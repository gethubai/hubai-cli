import webpack from 'webpack';
import {
  buildManifest,
  generateBuild,
  loadPackageJsonFromCurrentPath,
} from '../package.js';

/*
    Generates the build manifest every time the dev server compiles
*/
class HubaiWebpackPlugin {
  constructor(private readonly outputPath: string) {}

  apply(compiler: webpack.Compiler): void {
    compiler.hooks.afterCompile.tapAsync(
      'HubaiWebpackPlugin',
      (compilation, callback) => {
        if (compilation.getStats().hasErrors()) {
          console.error('Compilation has errors');

          callback();
          return;
        }

        const manifest = buildManifest(loadPackageJsonFromCurrentPath());
        if (!manifest) {
          throw new Error('Could not build manifest');
        }

        generateBuild(manifest, this.outputPath)
          .catch(err => {
            console.error('Could not generate build manifest', err);
          })
          .finally(callback);
      }
    );
  }
}

export default HubaiWebpackPlugin;
