import { isURL } from 'bucky.js';

const defaultMethods: Methods[] = [
    'get', 'head', 'post',
    'put', 'delete', 'connect',
    'options', 'trace', 'patch'
];

export default class RestManager {
    public baseUrl: string
    public headers: object;

    public routers: Map<string, RecursiveRouter>;
    public request: RestManagerOptions['request'];
    public router: RecursiveRouter;

    constructor(baseUrl: string, options?: RestManagerOptions) {
        if (!baseUrl || !isURL(baseUrl)) throw new Error('You did not provide a valid URL');
        if (options?.headers && typeof options.headers !== 'object') throw new Error('The header has to be the object type');
        if (options?.request && typeof options.request !== 'function') throw new Error('The "Request" property has to be a function');

        this.baseUrl = formatURL(baseUrl);
        this.headers = options?.headers || {};

        this.routers = new Map();
        this.request = options?.request;
        
        this.router = create(this.baseUrl, {
            headers: this.headers,
            request: this.request
        });
    }

    /**
     * @param name Identification name for your route
     * @param route Rota for this endpoint
     * @param headers Requisition header
     * @returns Object manipulator {@link https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Proxy Proxy}
     */
    public createRouter(name: string, path: string, headers?: object) {
        if (!name || !name.length || this.routers.has(name)) throw new Error('You have not defined a name for the route or it already exits!');
        if (!path || !path.length) throw new Error('You have not defined the URL route!');

        this.routers.set(name, router(this.baseUrl + path, {
            headers: headers && typeof headers === 'object'
                ? Object.assign(this.headers, headers)
                : this.headers,
            request: this.request
        }));

        return this.routers.get(name)!;
    }

    /**
     * @param name Existing route name
     * @returns A boolean value indicating if it was deleted
     */
    public deleteRouter(name: string) {
        if (!this.routers.has(name)) return false;
        return this.routers.delete(name);
    }

    /**
     * @param name Route name for pull
     * @returns A predefined route according to the body of the parent class
     */
    public getRouter(name: string) {
        if (!this.routers.has(name)) return false;
        return this.routers.get(name);
    }

    /**
     * @static
     * @param url URL to create a route
     * @param options Request body configuration
     * @returns Object manipulator {@link https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Proxy Proxy}
     */
    public static create(url: string, options?: RestManagerOptions) {
        return router(url, {
            headers: options?.headers,
            request: options?.request
        });
    }
}

/**
 * @param url URL to create a route
 * @param options Request body configuration
 * @returns Object manipulator {@link https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Proxy Proxy}
 */
export function create(url: string, options?: RestManagerOptions) {
    return router(url, {
        headers: options?.headers,
        request: options?.request
    });
}

function router(url: string, options: RestManagerOptions) {
    if (!url || !isURL(url)) throw new Error('You did not provide a valid URL');
    if (options?.headers && typeof options.headers !== 'object') throw new Error('The header has to be the object type');
    if (options?.request && typeof options.request !== 'function') throw new Error('The "Request" property has to be a function');

    const baseUrl = new URL(
            new URL(formatURL(url)).origin +
            new URL(formatURL(url)).pathname.replace(/\/\//gi, '')
        ).toString(),
        params = new URL(formatURL(url)).searchParams,
        routes: string[] = [];

    const handler = {
        get(target: any, key: string) {
            if (defaultMethods.includes(key as Methods)) return (data: any) => makeRequest(key as Methods, data, {
                baseUrl, params, routes,
                headers: options.headers,
                request: options.request
            });

            routes.push(key);
            return new Proxy<RecursiveRouter>(target, handler);
        },

        apply(target: any, _: unknown, args: any[]) {
            args.filter(Boolean).forEach(data => {
                if (typeof data === 'object' && !Array.isArray(data)) {
                    for (let [key, value] of Object.entries(data)) params.append(key, value as any);
                    return;
                }

                Array.isArray(data)
                    ? routes.push(...data)
                    : routes.push(data);
            });

            return new Proxy<RecursiveRouter>(target, handler);
        }
    };

    return new Proxy<RecursiveRouter>((() => { }) as any, handler);
}

async function makeRequest(method: Methods, data: any, options: RequestOptions) {
    let headers: any = options.headers ?? {},
        url = formatURL(options.baseUrl + ('/' + options.routes.join('/')));

    if (options.params.toString().length) url += `?${options.params.toString()}`;
    if (data && typeof data == 'object' && data?.headers) {
        Object.assign(headers, data.headers ?? {});
        delete data.headers;
    }

    if (!options?.request) return fetch(new URL(url).toString(), { method, headers, ...(data ?? {}) });
    return await options.request(url, method, { headers, ...(data ?? {}) });
}

function formatURL(url: string) {
    url = url.split('/').filter(Boolean).join('/');
    return new URL(url).toString();
}



export interface RequestOptions {
    baseUrl: string;
    routes: string[];
    params: URLSearchParams;
    headers?: any;
    request: RestManagerOptions['request'];
}

export type Methods =
    | 'get' | 'head'
    | 'post' | 'put'
    | 'delete' | 'connect'
    | 'options' | 'trace'
    | 'patch';

export type MethodsFunctions = {
    [K in Methods]: <Body = any, Response = any>(bodyRequest?: Body) => Promise<Response>
}

export type RecursiveRouter = {
    (...args: any[]): RecursiveRouter;
}
    & { [k: string]: RecursiveRouter }
    & MethodsFunctions;

export interface RestManagerOptions {
    headers?: object;
    request?: (url: string, method: Methods, data: any) => Promise<any> | any;
}