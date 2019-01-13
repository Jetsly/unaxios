import 'unfetch/polyfill';
const isJson = contentType => contentType && contentType.indexOf('application/json') > -1;
const isObj = val => Object.prototype.toString.call(val) === '[object Object]';
const isArray = val => Array.isArray(val);
const buildParam = (prefix, param) => {
  if (isObj(param) || isArray(param)) {
    return Object.keys(param).reduce((query, key) => {
      let val = param[`${key}`];
      let _key = isObj(val) || isArray(val) || isObj(param) ? key : ``;
      return query.concat(buildParam(prefix === '' ? key : `${prefix}[${_key}]`, val));
    }, []);
  } else {
    return [`${encodeURIComponent(`${prefix}`)}=${encodeURIComponent(param)}`];
  }
};
const buildGetParam = query => `?${buildParam('', query).join('&')}`;

let requestHandle: Array<{ fulfilled?: handle; rejected?: handle }> = [];
let responseHandle: Array<{ fulfilled?: handle; rejected?: handle }> = [];
let injectHandle = handle => ({
  use(fulfilled, rejected?) {
    const id =
      handle.push({
        fulfilled,
        rejected,
      }) - 1;
    return {
      dispose() {
        handle[id] = {};
      },
    };
  },
});
export type handle<T = any> = (config: T) => Promise<T>;
export interface IRequest {
  url?: string;
  method?: string;
  contentType?: string;
  timeOut?: number;
  headers?: { [key: string]: string };
  params?: { [key: string]: any };
  data?: any;
  withCredentials?: boolean;
}
export interface IRespone {
  data: any;
  status: number;
  statusText: string;
  headers: Headers;
  config: IRequest;
}
export const defaults: {
  baseURL: string;
  timeout: number;
  headers: { [key: string]: string };
} = {
  baseURL: '',
  timeout: Infinity,
  headers: {},
};
export const interceptors = {
  request: injectHandle(requestHandle),
  response: injectHandle(responseHandle),
};
const havTimeOut = time => time !== Infinity && time !== 0;
const request = config => {
  const { method, headers } = config;
  const init: RequestInit = {
    method,
    body: config.data,
    headers: Object.keys(headers).reduce(
      (preHeaders, key) => ((preHeaders.key = headers[key]), preHeaders),
      defaults.headers
    ),
  };
  if (config.withCredentials) {
    init.credentials = 'include';
  }
  const fetchPromise = [
    fetch(`${defaults.baseURL}${config.url}`, init).then(
      respone => ((respone['config'] = config), respone)
    ),
  ];
  const timeout = havTimeOut(config.timeout) ? config.timeout : defaults.timeout;
  if (havTimeOut(timeout)) {
    fetchPromise.push(
      new Promise<any>((_, reject) => setTimeout(() => reject({ isTimeout: true }), timeout))
    );
  }
  return Promise.race(fetchPromise);
};

function http(options: IRequest = {}) {
  const chain: handle[][] = [[request]];
  requestHandle.forEach(({ fulfilled, rejected }) => {
    chain.unshift([fulfilled, rejected]);
  });
  responseHandle.forEach(({ fulfilled, rejected }) => {
    chain.push([fulfilled, rejected]);
  });
  return chain.reduce<Promise<IRespone>>(
    (promise, [fulfilled, rejected]) => Promise.resolve(promise).then(fulfilled, rejected),
    ((options.method = options.method || 'GET'),
    (options.headers = options.headers || {}),
    options) as any
  );
}

interceptors.request.use(conf => {
  if (isObj(conf.params)) {
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
    ? res.json().then(data => ((res.data = data || res.data), res))
    : res
);

export default http;

export function get(url: string, params: { [key: string]: any } = {}, options: IRequest = {}) {
  return http(
    ((options.url = url || options.url), (options.params = params || options.params), options)
  );
}

export function post(url: string, data = {}, options: IRequest = {}) {
  return http(
    ((options.method = 'POST' || options.method),
    (options.contentType = 'application/json' || options.contentType),
    (options.url = url || options.url),
    (options.data = data || options.data),
    options)
  );
}
