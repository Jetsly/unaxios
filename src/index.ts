import 'unfetch/polyfill';
const isJson = contentType => contentType && contentType.indexOf('application/json') > -1;
const isObj = val => Object.prototype.toString.call(val) === '[object Object]';
const isArray = val => Array.isArray(val);
const buildParam = (prefix, param) => {
  if (isObj(param) || isArray(param)) {
    return Object.keys(param).reduce((query, key) => {
      let val = param[`${key}`];
      let _key = isObj(val) || isArray(val) || isObj(param) ? key : ``;
      return [...query, ...buildParam(prefix === '' ? key : `${prefix}[${_key}]`, val)];
    }, []);
  } else {
    return [`${encodeURIComponent(`${prefix}`)}=${encodeURIComponent(param)}`];
  }
};
const buildGetParam = query => `?${buildParam('', query).join('&')}`;

let requestHandle: Array<{ fulfilled?: handle; rejected?: handle }> = [];
let responseHandle: Array<{ fulfilled?: handle; rejected?: handle }> = [];
export type handle<T = any> = (config: T) => Promise<T>;
export interface IRequest {
  url?: string;
  method?: string;
  contentType?: string;
  headers?: { [key: string]: string };
  params?: { [key: string]: any };
  data?: any;
  withCredentials?: boolean;
}
export interface IRespone {}
export const defaults = {
  baseURL: '',
  timeOut: Infinity,
};
export const interceptors = {
  request: {
    use(fulfilled, rejected?) {
      requestHandle.push({
        fulfilled,
        rejected,
      });
      const id = requestHandle.length - 1;
      return {
        dispose() {
          requestHandle[id] = {};
        },
      };
    },
  },
  response: {
    use(fulfilled, rejected?) {
      responseHandle.push({
        fulfilled,
        rejected,
      });
      const id = responseHandle.length - 1;
      return {
        dispose() {
          responseHandle[id] = {};
        },
      };
    },
  },
};
const request = ({ url, method, headers, data: body, withCredentials = false }) =>
  Promise.race([
    fetch(`${defaults.baseURL}${url}`, {
      method,
      headers,
      body,
      ...(withCredentials ? { credentials: 'include' } : {}),
    }),
    new Promise((_, reject) => setTimeout(() => reject({ isTimeOut: true }), defaults.timeOut)),
  ]);
/**
 *
 * @param options
 */
function http(options: IRequest = {}) {
  const chain: handle[][] = [[request, undefined]];
  requestHandle.forEach(({ fulfilled, rejected }) => {
    chain.unshift([fulfilled, rejected]);
  });
  responseHandle.forEach(({ fulfilled, rejected }) => {
    chain.push([fulfilled, rejected]);
  });
  return chain.reduce(
    (promise, [fulfilled, rejected]) => promise.then(fulfilled, rejected),
    Promise.resolve({
      method: 'GET',
      headers: {},
      ...options,
    })
  );
}

interceptors.request.use(conf => {
  if (conf.params && isObj(conf.params)) {
    conf.url = [conf.url, buildGetParam(conf.params)].join('');
  }
  if (isJson(conf.contentType) && conf.data) {
    conf.data = JSON.stringify(conf.data);
  }
  if (conf.contentType) {
    conf.headers['content-type'] = conf.contentType;
  }
  return conf;
});

interceptors.response.use(res =>
  isJson(res.headers.get('content-type'))
    ? res.json().then(data => ({
        ...res,
        data,
      }))
    : res
);

export default http;

/**
 *
 * @param url
 * @param params
 * @param options
 */
export function get(url: string, params: { [key: string]: any } = {}, options: IRequest = {}) {
  return http({
    url,
    params,
    ...options,
  });
}

/**
 *
 * @param url
 * @param data
 * @param options
 */
export function post(url: string, data = {}, options: IRequest = {}) {
  return http({
    method: 'POST',
    contentType: 'application/json',
    url,
    data,
    ...options,
  });
}
