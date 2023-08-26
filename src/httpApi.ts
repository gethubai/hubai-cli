import nodeFetch, {
  type BodyInit,
  type Response as HttpResponse,
} from 'node-fetch';

import authService from './auth/authService.js';
import { API } from './consts.js';
import logger from './logger.js';

export type ApiResponse<TResult> = {
  result?: TResult;
  success: boolean;
  status: number;
  statusText: string;
  error?: string;
};

export type ApiOptions = {
  anonymous?: boolean;
  headers?: HeadersInit;
};

export type GetOptions = ApiOptions;

export type PostOptions = ApiOptions;

export class HttpApi {
  async get<TResponse>(
    url?: string,
    options?: GetOptions
  ): Promise<ApiResponse<TResponse>> {
    const fullUrl = this.getUrl(url);

    const headers = await this.getDefaultHeaders(options);
    const response = await nodeFetch(fullUrl, {
      method: 'GET',
      headers,
    });

    return await this.getResponseData<TResponse>(response);
  }

  async post<TResponse>(
    url?: string,
    body?: BodyInit | any,
    options?: PostOptions
  ): Promise<ApiResponse<TResponse>> {
    const fullUrl = this.getUrl(url);

    const headers = await this.getDefaultHeaders(options);

    const requestOptions = {
      method: 'POST',
      headers,
      body,
    };

    const response = await nodeFetch(fullUrl, requestOptions);

    return await this.getResponseData<TResponse>(response);
  }

  async postJson<TResponse>(
    url?: string,
    body?: unknown,
    options?: PostOptions
  ): Promise<ApiResponse<TResponse>> {
    if (!options) options = {};

    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');

    return await this.post<TResponse>(url, JSON.stringify(body), {
      ...options,
      headers,
    });
  }

  async getResponseData<TResponse>(
    response: HttpResponse
  ): Promise<ApiResponse<TResponse>> {
    const result = await this.tryGetJson<TResponse>(response);
    if (!response.ok) {
      const error = `Request failed with status ${response.status}: ${response.statusText}`;
      logger.debug('ResponseErr', error, '\nrequest response:\n', result);
      return {
        success: false,
        status: response.status,
        statusText: response.statusText,
        error,
        result,
      };
    }
    return {
      success: true,
      result,
      status: response.status,
      statusText: response.statusText,
    };
  }

  async tryGetJson<TResponse>(
    response: HttpResponse
  ): Promise<TResponse | undefined> {
    try {
      return (await response.json()) as TResponse;
    } catch {
      // ignore
    }
  }

  getUrl(url?: string): string {
    return API.baseUrl + (url ?? '');
  }

  async getDefaultHeaders(options?: ApiOptions): Promise<HeadersInit> {
    const headers = new Headers(options?.headers);

    if (!options?.anonymous) {
      const accessToken = await authService.getOrRenewAccessToken();

      if (accessToken) {
        headers.set('Authorization', 'Bearer ' + accessToken);
      }
    }

    return headers;
  }
}

const httpClient = new HttpApi();
export default httpClient;
