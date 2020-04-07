import { extend, RequestOptionsInit, RequestResponse } from 'umi-request'

const errorHandler = (error: RequestResponse<any>) => {
  const { data: response = {} } = error
  return response
}

/**
 * Request function
 */
function request<T>(
  url: string,
  options: RequestOptionsInit,
  token?: string,
): Promise<T> {
  let headers = options.headers || {}
  if (token) {
    headers = {
      Authorization: `${token}`,
      ...headers,
    }
  }
  return extend({
    errorHandler,
    credentials: 'include',
    headers,
    ...options,
  })(url)
}

export default request
