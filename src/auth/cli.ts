import { Command } from 'commander';
import logger from '../logger.js';
import { signIn } from './signIn.js';
import authService from './authService.js';

const authCommands = [
  new Command('login').description('Sign in to HubAI').action(async () => {
    const result = await signIn();

    if (result?.access_token && result?.refresh_token) {
      await authService.saveCredentials(result);

      if (await authService.isLoggedIn()) {
        logger.success('Logged in successfully');
      } else {
        logger.error('Could not save credentials');
      }
    }
  }),
  new Command('status')
    .description('Check if you are logged in')
    .action(async () => {
      const loggedUser = await authService.getLoggedUser();
      const checkCredentials = await authService.getOrRenewAccessToken();
      if (loggedUser && checkCredentials) {
        logger.success(
          'Logged in as %s - %s',
          loggedUser.name,
          loggedUser.email
        );
      } else {
        logger.warn('You are not logged in');
        logger.info('Please run "hubai auth login" to sign in');
      }
    }),
  new Command('logout').description('Sign out of HubAI').action(async () => {
    await authService.logout();
    logger.success('Logged out successfully');
  }),
];

export default authCommands;
