import fs from 'fs-extra';
import FormData from 'form-data';
import path from 'path';
import logger from '../logger.js';
import httpClient from '../httpApi.js';

export type PublishPackageOptions = {
  packagePath: string;
  packageType: 'brain' | 'extension';
};

export async function publishPackage({
  packagePath,
  packageType,
}: PublishPackageOptions): Promise<void> {
  logger.info('Publishing package...');
  const formData = new FormData();

  const buffer = fs.readFileSync(packagePath);

  // Append the zipped package
  formData.append('package', buffer, {
    contentType: 'multipart/form-data',
    //   name: 'package',
    filename: path.basename(packagePath),
  });

  // Sending the request to the ASP.NET Core endpoint
  const response = await httpClient.post<any>(
    `/${packageType}/publish`,
    formData
  );

  logger.debug('Publish Response:', response);

  if (!response.success) {
    logger.error('Failed to publish package', response.error);
    logger.error(response.result);
  } else {
    logger.success(
      'Successfully published package, it might take a few minutes to show up in the app'
    );
  }
}
