import 'unfetch/polyfill';
export declare type handle<T = any> = (config: T) => Promise<T>;
export interface IRequest {
    url?: string;
    method?: string;
    contentType?: string;
    timeOut?: number;
    headers?: {
        [key: string]: string;
    };
    params?: {
        [key: string]: any;
    };
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
export declare const defaults: {
    baseURL: string;
    timeout: number;
    headers: {
        [key: string]: string;
    };
};
export declare const interceptors: {
    request: {
        use(fulfilled: any, rejected?: any): {
            dispose(): void;
        };
    };
    response: {
        use(fulfilled: any, rejected?: any): {
            dispose(): void;
        };
    };
};
declare function http(options?: IRequest): Promise<IRespone>;
export default http;
export declare function get(url: string, params?: {
    [key: string]: any;
}, options?: IRequest): Promise<IRespone>;
export declare function post(url: string, data?: {}, options?: IRequest): Promise<IRespone>;
