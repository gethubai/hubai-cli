import httpClient from '../httpApi.js';
import logger from '../logger.js';
import { Publisher } from './models/publisher.js';

export type CreatePublisherParams = {
  name: string;
  displayName: string;
};

export async function createPublisher(
  request: CreatePublisherParams
): Promise<Publisher | undefined> {
  if (!request.name || !request.displayName) {
    throw new Error(
      'Please provide a name and a display name using --name and --displayName options'
    );
  }

  const response = await httpClient.postJson<Publisher>('/publisher', request);

  if (response.success && response.result) {
    logger.success(
      `Publisher ${response.result.displayName} has been successfully created`,
      response.result
    );
  } else {
    logger.error('Failed to create publisher', response.error);
    logger.error('Response:', response.result);
  }

  return response.result;
}
