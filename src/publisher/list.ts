import httpClient from '../httpApi.js';
import logger from '../logger.js';
import { Publisher } from './models/publisher.js';

export async function listPublishers(): Promise<Publisher[] | undefined> {
  const response = await httpClient.get<Publisher[]>('/publisher');

  if (response.success && response.result) {
    if (response.result.length === 0) {
      logger.info('No publishers found');
      return;
    }

    logger.info('Publishers:');
    response.result.forEach(publisher => {
      logger.info(
        `Name: ${publisher.name} - Display name: ${publisher.displayName} - Created at (UTC): ${publisher.createdAt}`
      );
    });
  } else {
    logger.error('Failed to list publishers', response.error);
    logger.error('Response:', response.result);
  }

  return response.result;
}
