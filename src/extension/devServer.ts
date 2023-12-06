import path from 'path';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import { pathToFileURL } from 'url';
import { getWebpackOptions } from './package.js';
import HubaiWebpackPlugin from './webpack/hubai-plugin.js';

export async function startExtensionDevServer(): Promise<void> {
  const filePath = path.join(process.cwd(), 'configs', 'webpack.dev.js');
  const fileUrl = pathToFileURL(filePath);

  const webpackConfig = (
    await import(/* webpackIgnore: true */ fileUrl.toString())
  ).default;

  const outputPath = path.join(process.cwd(), 'dist');
  const config = getWebpackOptions({ outputPath });
  // Plugin to generate the build manifest every time the dev server compiles
  config.plugins?.push(new HubaiWebpackPlugin(outputPath));
  const compiler = webpack({
    ...config,
    mode: 'development',
    devtool: 'eval',
    cache: false,
    optimization: {
      minimize: false,
    },
  });

  const devServerOptions = { ...webpackConfig.devServer, open: true };
  const server = new WebpackDevServer(devServerOptions, compiler);

  server.startCallback(() => {
    console.log('Successfully started development server for extension');
  });
}
