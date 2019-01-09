<p align="center">
  <a href="https://www.npmjs.org/package/unaxios"><img src="https://img.shields.io/npm/v/unaxios.svg?style=flat" alt="npm"></a>
  <a href="https://unpkg.com/unaxios/dist"><img src="https://img.badgesize.io/https://unpkg.com/unaxios/dist/index.js?compression=gzip" alt="gzip size"></a>
  <a href="https://www.npmjs.com/package/unaxios"><img src="https://img.shields.io/npm/unaxios.svg" alt="downloads" ></a>
  <a href="https://travis-ci.org/Jetsly/unaxios"><img src="https://travis-ci.org/Jetsly/unaxios.svg?branch=master" alt="travis"></a>
</p>

# unaxios

> Tiny axios functional

- Inspire by [axios](https://github.com/axios/axios)

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [Config Defaults](#config-defaults)
- [Interceptors](#interceptors)
- [Examples & Demos](./test/index.test.ts)
- [License](#license)

## Installation

For use with [node](http://nodejs.org) and [npm](https://npmjs.com):

```sh
npm install --save unaxios
```

Then with a module bundler like [rollup](http://rollupjs.org/) or [webpack](https://webpack.js.org/), use as you would anything else:

```javascript
// using ES6 modules
import unaxios from 'unaxios';

// using CommonJS modules
var unaxios = require('unaxios');
```

The [UMD](https://github.com/umdjs/umd) build is also available on [unpkg](https://unpkg.com):

```html
<script src="https://unpkg.com/unaxios/dist/unaxios.umd.js"></script>
```

You can find the library on `window.unaxios`.

## Usage

```js
import http, { get, post } from 'unaxios';

// make request
http(config).then(function(response) {
  console.log(response.data);
  console.log(response.status);
  console.log(response.statusText);
  console.log(response.headers);
});

get(url[, params[, config]])
post(url[, data[, config]])
```

### request config

```js
{
  // `url` is the server URL that will be used for the request
  url:'/url'
  // `method` is the request method to be used when making the request
  method: 'get', // default
  // `headers` are custom headers to be sent
  headers: {'X-Requested-With': 'XMLHttpRequest'},
  // `params` are the URL parameters to be sent with the request
  // Must be a plain object
  params: {
    firstName: 'ddot'
  },
  // `data` is the data to be sent as the request body
  // Only applicable for request methods 'PUT', 'POST', and 'PATCH'
  data: {
    firstName: 'ddot'
  },
  // contentType headers to be sent
  contentType: '' ,// when post method default application/json
  // `withCredentials` indicates whether or not cross-site Access-Control requests
  // should be made using credentials
  withCredentials: false, // default
}
```

### response schema 

```js
{
  // `data` is the response that was provided by the server
  data: {},

  // `status` is the HTTP status code from the server response
  status: 200,

  // `statusText` is the HTTP status message from the server response
  statusText: 'OK',

  // `headers` the headers that the server responded with
  // All header names are lower cased
  headers: {},
}
```

## Config Defaults

You can specify config defaults that will be applied to every request.

### Global unaxios defaults

```js
import { defaults } from 'unaxios';
defaults.baseURL = 'https://api.example.com';
```

## Interceptors

You can intercept requests or responses before they are handled by `then` or `catch`.

```js
import { interceptors } from 'unaxios';
// Add a request interceptor
interceptors.request.use(function (config) {
    // Do something before request is sent
    return config;
  }, function (error) {
    // Do something with request error
    return Promise.reject(error);
  });

// Add a response interceptor
interceptors.response.use(function (response) {
    // Do something with response data
    return response;
  }, function (error) {
    // Do something with response error
    return Promise.reject(error);
  });
```

If you may need to remove an interceptor later you can.

```js
import { interceptors } from 'unaxios';
const myInterceptor = interceptors.request.use(function () {/*...*/});
myInterceptor.dispose()
```


## License

[MIT License](LICENSE.md)
