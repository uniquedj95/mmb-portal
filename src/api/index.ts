import useAuth from "../composables/useAuth";
import {
  BadRequestError,
  NotFoundError,
  BadEntityError,
  RecordConflictError,
  ApiServiceError,
  ApiError,
  InvalidCredentialsError
} from "./errors";

export type ApiRequestParam = Record<string, string | number | boolean>;
export type ApiRequestData = Record<string, any>;
export type ApiRequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type ApiEvent = "beforeRequest" | "afterRequest" | "serverClash";
export type ApiEventListener = (data?: any) => void;

export interface ApiPaginatedResponse<T> {
  data: T[];
  current_page: number;
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

class ApiClient {
  private listeners: Record<ApiEvent, Array<ApiEventListener>>;
  private baseUrl: string;

  constructor(){
    this.baseUrl = this.loadConfig();
    this.listeners = {
      beforeRequest: [],
      afterRequest: [],
      serverClash: [],
    }
  }

  /**
   * Add an event listener for a specific event
   *
   * @param event - The name of the event to listen for. Acceptable values are "beforeRequest", "afterRequest", or "serverClash".
   * @param listener - The callback function to execute when the event occurrs.
   */
  on(event: ApiEvent, listener: ApiEventListener) {
    this.listeners[event].push(listener);
  }

  /**
   * Remove an event listener for the specified event.
   *
   * @param event - The event from which to remove the listener.
   * @param listener - The callback function to remove.
   */
  off(event: ApiEvent, listener: ApiEventListener) {
    const index = this.listeners[event].indexOf(listener);
    if (index !== -1) {
      this.listeners[event].splice(index, 1);
    }
  }

  /**
   * Trigger an event with optional data.
   *
   * @param event - The event to trigger.
   * @param data - Optional data to pass to event listeners.
   */
  private triggerEvent(event: ApiEvent, data?: any) {
    this.listeners[event].forEach(listener => listener(data));
  }

  /**
   * Loads the API configuration from environment variables.
   *
   * @returns The API base URL string.
   */
  private loadConfig(): string {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string 
      ?? 'http://localhost:5000/api/';

    return apiBaseUrl.endsWith('/')
      ? apiBaseUrl
      : apiBaseUrl + '/';
  }

  
  /**
 * Adds query parameters to a URL if provided in the 'params' object.
 *
 * @param url - The URL to which query parameters may be added.
 * @param params - An object representing query parameters as key-value pairs.
 * @returns The URL with query parameters added, or the original URL if 'params' is undefined or empty.
 */
  private parameterizeUrl(url: string, params?: ApiRequestParam) {
    if(!params) return url;
    const _params = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    return `${url}?${_params}`;
  }

  /**
   * Expands a relative URI into a complete API endpoint URL using the application configuration.
   *
   * @param uri - The relative URI to expand.
   * @param params - Optional query parameters to include in the request.
   * @returns The complete API endpoint URL.
   */
  private async expandPath(uri: string, params?: ApiRequestParam): Promise<string> {
    const cleanUri = uri.startsWith('/') ? uri.substring(1) : uri;
    const uriWithParams = this.parameterizeUrl(cleanUri, params);

    // Combine baseUrl with the URI
    return `${this.baseUrl}${uriWithParams}`;
  }

  /**
   * Retrieves and returns the request headers for an API request.
   *
   * @returns A Headers object containing the request headers,
   *  including Authorization and Content-Type if available.
   */
  private getRequestHeaders() {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    const auth = useAuth();
    if(auth.isAuthenticated.value) {
      headers.append('Authorization', `Bearer ${auth.token.value}`);
    }

    return headers;
  }

  /**
   * Handles a fetch response by processing the response based on the HTTP status code.
   *
   * @param response - The fetch response object.
   * @returns A Promise that resolves to the processed response json data.
   * @throws {BadRequestError} If the HTTP status code is 400.
   * @throws {NotFoundError} If the HTTP status code is 404.
   * @throws {BadEntityError} If the HTTP status code is 422.
   * @throws {RecordConflictError} If the HTTP status code is 409.
   * @throws {ApiServiceError} If the HTTP status code is 502.
   * @throws {ApiError} If none of the above status codes match.
   */
   private async handleResponse<T = any>(response?: Response): Promise<T> {
    if(response){
      if([200, 201].includes(response.status)) return response.json();
      const { errors } = await response.json();
      switch(response.status) {
        case 400: throw new BadRequestError(response.statusText, errors);
        case 401: throw new InvalidCredentialsError();
        case 404: throw new NotFoundError(response.statusText);
        case 422: throw new BadEntityError(response.statusText, errors);
        case 409: throw new RecordConflictError(response.statusText, errors);
        case 502: throw new ApiServiceError(errors ?? "Gateway Error")
        default: break;
      }
    }
    throw new ApiError('An internal server error has occured');
  }

  /**
   * Executes a fetch request with the specified HTTP method, URI, query parameters, and request data.
   *
   * @param uri - The resource endpoint to which the request will be made.
   * @param method - The HTTP method for the request (e.g., 'GET', 'POST', 'PUT', 'DELETE').
   * @param params - Optional query parameters to include in the request.
   * @param data - Optional request data to send in the request body.
   * @returns A Promise that resolves to the response data from the fetch request.
   */
  private async execFetch<T = any>(uri: string, method: ApiRequestMethod, params?: ApiRequestParam, data?: any): Promise<T> {
    this.triggerEvent("beforeRequest", { uri, method, params, data });
    const fullURL = await this.expandPath(uri, params);
    const options: RequestInit = {
      method,
      headers: this.getRequestHeaders(),
    };
    if (data) options.body = JSON.stringify(data);
    let response = undefined;
    try {
      response = await fetch(fullURL, options);
      this.triggerEvent("afterRequest", {uri, method, params, data, response });
      return this.handleResponse<T>(response);
    } catch (e) {
      if(/NetworkError|Failed to fetch/i.test(`${e}`)) {
        this.triggerEvent("serverClash")
      }
      return this.handleResponse();
    }
  }

  /**
   * Perform a GET request and return the response data as JSON.
   *
   * @param uri - The resource endpoint to which the request will be made.
   * @param params - Optional query parameters.
   * @returns A Promise that resolves to the response data as JSON.
   */
  getJson<T = any>(uri: string, params?: ApiRequestParam) {
    return this.execFetch<T>(uri, "GET", params);
  }

  /**
   * Perform a POST request and return the response data as JSON.
   *
   * @param uri - The resource endpoint to which the request will be made.
   * @param params - Optional query parameters.
   * @param data - Optional data object
   * @returns A Promise that resolves to the response data as JSON.
   */
  postJson<T = any>(uri: string, data?: ApiRequestData, params?: ApiRequestParam){
    return this.execFetch<T>(uri, "POST", params, data);
  }

  /**
   * Perform a PUT request and send data as JSON.
   *
   * @param uri - The resource endpoint to which the request will be made.
   * @param params - Optional query parameters.
   * @param data - The data to send as JSON.
   * @returns A Promise that resolves to the response data as JSON.
   */
  async putJson<T = any>(url: string, data: ApiRequestData, params?: ApiRequestParam) {
    return this.execFetch<T>(url, "PUT", params, data)
  }

  /**
   * Perform a PATCH request and send data as JSON.
   *
   * @param uri - The resource endpoint to which the request will be made.
   * @param data - The data to send as JSON.
   * @param params - Optional query parameters.
   * @returns A Promise that resolves to the response data as JSON.
   */
  async patchJson<T = any>(url: string, data: ApiRequestData, params?: ApiRequestParam) {
    return this.execFetch<T>(url, "PATCH", params, data);
  }

  /**
   * Perform a DELETE request.
   *
   * @param uri - The resource endpoint to which the request will be made.
   * @param params - Optional query parameters.
   * @param data - Optional data to send.
   */
  async delete(url: string, params?: ApiRequestParam, data?: ApiRequestData,): Promise<void> {
    await this.execFetch(url, "DELETE", params, data);
  }
}

export default new ApiClient();