import logger from '../logger.js';
import authApi from './api/authApi.js';
import { AuthTokens } from './models/authTokens.js';

export async function signIn(): Promise<AuthTokens | undefined> {
  const deviceCode = await authApi.getDeviceCode();

  logger.info(
    `Please visit the following URL: ${deviceCode.verification_uri_complete}`
  );
  logger.info(
    `Or go to ${deviceCode.verification_uri} and enter the user code: ${deviceCode.user_code}`
  );

  let isLogged = false;
  let timeout = deviceCode.expires_in * 1000;

  while (!isLogged) {
    const timeToWait = deviceCode.interval * 1000 + 2000; // add 2 seconds to avoid pooling too fast issues
    timeout -= timeToWait;

    if (timeout <= 0) {
      throw new Error('Sign in timed out');
    }

    // wait for the interval
    await new Promise(resolve => setTimeout(resolve, timeToWait));

    const loginResponse = await authApi.deviceLogin(deviceCode.device_code);

    if (loginResponse.error) {
      if (loginResponse.error === 'authorization_pending') continue;

      throw new Error(
        `Could not sign in: ${loginResponse.error}: ${loginResponse.error_description}`
      );
    }

    if (loginResponse.access_token && loginResponse.refresh_token) {
      isLogged = true;
      return {
        access_token: loginResponse.access_token,
        refresh_token: loginResponse.refresh_token,
      };
    }
  }
}
