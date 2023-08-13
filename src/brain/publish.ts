import fs from 'fs-extra';
import FormData from 'form-data';
import nodeFetch from 'node-fetch';
import path from 'path';
import logger, { Logger } from '../logger.js';

export type PublishBrainOptions = {
  packagePath: string;
  packageName?: string;
};

export async function publishBrain({ packagePath }: PublishBrainOptions) {
  logger.info('Publishing brain...');
  const formData = new FormData();

  const buffer = fs.readFileSync(packagePath);

  // Append the zipped package
  formData.append('package', buffer, {
    contentType: 'multipart/form-data',
    //   name: 'package',
    filename: path.basename(packagePath),
  });

  // Sending the request to the ASP.NET Core endpoint
  const response = await nodeFetch('http://localhost:5259/api/brain/publish', {
    method: 'POST',
    body: formData, // TODO: FIX THIS
  });

  //logger.info('res', response);

  if (!response.ok) {
    const responseData = (await response.json()) as any;

    logger.error('Failed to publish brain');
    logger.error(responseData);
  } else {
    logger.success(
      'Successfully published brain, it might take a few minutes to show up in the app'
    );
  }
}
