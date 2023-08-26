import httpClient from '../../httpApi.js';

export type DeviceCodeResponse = {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
  verification_uri_complete: string;
};

export type LoginResponse = {
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
  error?: string;
  error_description?: string;
};

export class AuthApi {
  async getDeviceCode(): Promise<DeviceCodeResponse> {
    const response = await httpClient.get<DeviceCodeResponse>(
      '/auth/cli/loginUrl',
      { anonymous: true }
    );

    if (response.result && response.success) return response.result;

    throw new Error(
      'Failed to get device code:' + JSON.stringify(response.result)
    );
  }

  async deviceLogin(deviceCode: string): Promise<LoginResponse> {
    const response = await httpClient.get<LoginResponse>(
      `/auth/cli/login?deviceCode=${deviceCode}`,
      { anonymous: true }
    );
    return response.result!;
  }

  async getNewToken(refreshToken: string): Promise<LoginResponse> {
    const response = await httpClient.get<LoginResponse>(
      `/auth/cli/refreshToken?refreshToken=${refreshToken}`,
      { anonymous: true }
    );
    return response.result!;
  }
}

const authApi = new AuthApi();

export default authApi;
