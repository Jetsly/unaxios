/* unaxios version 0.1.5 */
import 'unfetch/polyfill';

var isJson = function (contentType) { return contentType && contentType.indexOf('application/json') > -1; };
var isObj = function (val) { return Object.prototype.toString.call(val) === '[object Object]'; };
var isArray = function (val) { return Array.isArray(val); };
var buildParam = function (prefix, param) {
    if (isObj(param) || isArray(param)) {
        return Object.keys(param).reduce(function (query, key) {
            var val = param["" + key];
            var _key = isObj(val) || isArray(val) || isObj(param) ? key : "";
            return query.concat(buildParam(prefix === '' ? key : prefix + "[" + _key + "]", val));
        }, []);
    }
    else {
        return [encodeURIComponent("" + prefix) + "=" + encodeURIComponent(param)];
    }
};
var buildGetParam = function (query) { return "?" + buildParam('', query).join('&'); };
var requestHandle = [];
var responseHandle = [];
var injectHandle = function (handle) { return ({
    use: function (fulfilled, rejected) {
        var id = handle.push({
            fulfilled: fulfilled,
            rejected: rejected,
        }) - 1;
        return {
            dispose: function () {
                handle[id] = {};
            },
        };
    },
}); };
var defaults = {
    baseURL: '',
    timeout: Infinity,
    headers: {},
};
var interceptors = {
    request: injectHandle(requestHandle),
    response: injectHandle(responseHandle),
};
var havTimeOut = function (time) { return time !== Infinity && time !== 0; };
var request = function (config) {
    var method = config.method, headers = config.headers;
    var init = {
        method: method,
        body: config.data,
        headers: Object.keys(headers).reduce(function (preHeaders, key) { return ((preHeaders[key] = headers[key]), preHeaders); }, defaults.headers),
    };
    if (config.withCredentials) {
        init.credentials = 'include';
    }
    var fetchPromise = [
        fetch("" + defaults.baseURL + config.url, init).then(function (respone) { return ((respone['config'] = config), respone); }),
    ];
    var timeout = havTimeOut(config.timeout) ? config.timeout : defaults.timeout;
    if (havTimeOut(timeout)) {
        fetchPromise.push(new Promise(function (_, reject) { return setTimeout(function () { return reject({ isTimeout: true }); }, timeout); }));
    }
    return Promise.race(fetchPromise);
};
function http(options) {
    if (options === void 0) { options = {}; }
    var chain = [[request]];
    requestHandle.forEach(function (_a) {
        var fulfilled = _a.fulfilled, rejected = _a.rejected;
        chain.unshift([fulfilled, rejected]);
    });
    responseHandle.forEach(function (_a) {
        var fulfilled = _a.fulfilled, rejected = _a.rejected;
        chain.push([fulfilled, rejected]);
    });
    return chain.reduce(function (promise, _a) {
        var fulfilled = _a[0], rejected = _a[1];
        return Promise.resolve(promise).then(fulfilled, rejected);
    }, ((options.method = options.method || 'GET'),
        (options.headers = options.headers || {}),
        options));
}
interceptors.request.use(function (conf) {
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
interceptors.response.use(function (res) {
    return isJson(res.headers.get('content-type'))
        ? res.json().then(function (data) { return ((res.data = data || res.data), res); })
        : res;
});
function get(url, params, options) {
    if (params === void 0) { params = {}; }
    if (options === void 0) { options = {}; }
    return http(((options.url = url || options.url), (options.params = params || options.params), options));
}
function post(url, data, options) {
    if (data === void 0) { data = {}; }
    if (options === void 0) { options = {}; }
    return http(((options.method = 'POST' || options.method),
        (options.contentType = 'application/json' || options.contentType),
        (options.url = url || options.url),
        (options.data = data || options.data),
        options));
}

export default http;
export { defaults, interceptors, get, post };
