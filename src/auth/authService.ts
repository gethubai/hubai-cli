import keytar from 'keytar';
import jwtDecode from 'jwt-decode';
import { AuthTokens } from './models/authTokens.js';
import logger from '../logger.js';
import { LoggedUser } from './models/loggedUser.js';
import authApi from './api/authApi.js';

const SERVICE_NAME = 'hubaicli';

export class AuthService {
  private cachedTokens?: AuthTokens;

  async saveCredentials(token: AuthTokens): Promise<void> {
    await keytar.setPassword(SERVICE_NAME, 'access_token', token.access_token);
    await keytar.setPassword(
      SERVICE_NAME,
      'refresh_token',
      token.refresh_token
    );

    logger.debug('Saved credentials');

    this.cachedTokens = token;
  }

  async getCredentials(): Promise<AuthTokens | undefined> {
    if (!this.cachedTokens) {
      const credentials = await keytar.findCredentials(SERVICE_NAME);
      const accessToken = credentials.find(c => c.account === 'access_token');
      const refreshToken = credentials.find(c => c.account === 'refresh_token');

      if (!accessToken || !refreshToken) {
        return undefined;
      }

      this.cachedTokens = {
        access_token: accessToken.password,
        refresh_token: refreshToken.password,
      };
    }

    return this.cachedTokens;
  }

  async isLoggedIn(): Promise<boolean> {
    const credentials = await this.getCredentials();
    return !!credentials;
  }

  async getLoggedUser(): Promise<LoggedUser | undefined> {
    const credentials = await this.getCredentials();
    if (!credentials) return undefined;

    const loggedUser = jwtDecode.default<any>(credentials.access_token);

    if (!loggedUser?.sub) return undefined;

    return {
      id: loggedUser.sub,
      name: loggedUser.name,
      email: loggedUser.email,
      permissions: loggedUser.permissions,
      tokenExpiration: new Date(loggedUser.exp * 1000),
    };
  }

  async getOrRenewAccessToken(): Promise<string | undefined> {
    const credentials = await this.getCredentials();
    if (!credentials) return undefined;

    const decodedToken = jwtDecode.default<any>(credentials.access_token);
    // If the token is not expired, return it
    if (decodedToken.exp * 1000 > Date.now()) {
      return credentials.access_token;
    }

    // If the token is expired, refresh it
    await this.refreshAccessToken();

    // Return the new access token
    return await this.getOrRenewAccessToken();
  }

  async refreshAccessToken(): Promise<void> {
    const credentials = await this.getCredentials();

    if (!credentials)
      throw new Error('Could not refresh access token, not logged in');

    logger.debug('Getting new access token');

    const refreshTokenResult = await authApi.getNewToken(
      credentials.refresh_token
    );

    logger.debug('Got new access token', refreshTokenResult);

    if (refreshTokenResult?.access_token) {
      await this.saveCredentials({
        access_token: refreshTokenResult.access_token,
        refresh_token: credentials.refresh_token,
      });
    } else {
      logger.error('Refresh token is no longer valid, please sign in again');
      await this.logout();
    }
  }

  async logout(): Promise<void> {
    await keytar.deletePassword(SERVICE_NAME, 'access_token');
    await keytar.deletePassword(SERVICE_NAME, 'refresh_token');
    this.cachedTokens = undefined;
  }
}

const authService = new AuthService();
export default authService;
