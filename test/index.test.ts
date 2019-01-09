import * as fetchMock from 'fetch-mock';
import http, { get, post, interceptors, defaults } from '../src/index';

describe('ajax', () => {
  test('get', async () => {
    const url = '/defaults_get';
    const distUrl = `${defaults.baseURL}${url}`;
    fetchMock.get(`begin:${distUrl}`, url => ({
      url,
    }));
    const mapUrl: Array<[{ [key: string]: any }, string]> = [
      [undefined, ''],
      [1 as any, ''],
      [{ a: 1 }, '?a=1'],
      [{ a: 1, '&': '1' }, '?a=1&%26=1'],
      [{ a: 1, b: 1 }, '?a=1&b=1'],
      [{ a: 1, b: [1, 2] }, '?a=1&b%5B%5D=1&b%5B%5D=2'],
      [{ a: { b: 1 } }, '?a%5Bb%5D=1'],
    ];
    for (let index = 0; index < mapUrl.length; index++) {
      const [params, query] = mapUrl[index];
      expect((await get(url, params)).data.url).toBe(`${distUrl}${query}`);
    }
  });

  test('post', async () => {
    const url = '/defaults_post';
    const distUrl = `${defaults.baseURL}${url}`;
    fetchMock.post(distUrl, { url: distUrl });
    const { data } = await post(url);
    expect(data.url).toBe(distUrl);
  });
});

describe('defaults', () => {
  beforeAll(() => {
    defaults.baseURL = 'http://example.com';
  });

  test('defaults url', async () => {
    const url = '/defaults_url';
    const distUrl = `${defaults.baseURL}${url}`;
    fetchMock.once(distUrl, { url: distUrl });
    const { data } = await http({ url });
    expect(data.url).toBe(distUrl);
  });

  test('defaults timeout', async () => {
    defaults.timeOut = 1000;
    const url = '/defaults_timeout';
    const distUrl = `${defaults.baseURL}${url}`;
    fetchMock.once(distUrl, new Promise(res => setTimeout(res, 2000, 404)));
    const { isTimeOut } = await http({ url }).catch(a => a);
    expect(isTimeOut).toBe(true);
  });
  afterAll(() => {
    defaults.baseURL = '';
    defaults.timeOut = Infinity;
  });
});

describe('interceptors', () => {
  test('request', async () => {
    const url = '/defaults_request';
    const distUrl = `${defaults.baseURL}${url}`;
    fetchMock.post(distUrl, (url, { method }) => ({ method }));
    fetchMock.get(distUrl, (url, { method }) => ({ method }));
    const disposable = interceptors.request.use(config => ({
      ...config,
      method: 'post',
    }));
    expect((await http({ url })).data.method).toMatch(/post/i);
    disposable.dispose();
    expect((await http({ url })).data.method).toMatch(/get/i);
  });
  test('response', async () => {
    const disposable = interceptors.response.use(res => res.data);
    const url = '/defaults_response';
    const distUrl = `${defaults.baseURL}${url}`;
    fetchMock.post(distUrl, { url: distUrl });
    expect((await post(url)).url).toBe(distUrl);
    disposable.dispose();
    expect((await post(url)).data.url).toBe(distUrl);
  });
});
