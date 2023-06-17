export default class RestManager<K extends Methods> {
    static defaultMethods: Methods[] = [
        'get', 'head', 'post',
        'put', 'delete', 'connect',
        'options', 'trace', 'patch'
    ];

    public baseUrl: string
    public headers: object;
    public methods: Methods[];
    public routers: Map<string, RecursiveRouter<MethodsFunctions, K>>;
    public request: RestManagerOptions['request'];

    constructor(baseUrl: string, options?: RestManagerOptions<K>) {
        if (!baseUrl || !RestManager.isURL(baseUrl)) throw new Error('You did not provide a valid URL');
        if (options?.methods && !options.methods.filter(v => RestManager.defaultMethods.includes(v)).length) throw new Error('Requisition method not supported or defined');
        if (options?.headers && typeof options.headers !== 'object') throw new Error('The header has to be the object type');
        if (options?.request && typeof options.request !== 'function') throw new Error('The "Request" property has to be a function');

        this.baseUrl = RestManager.formatURL(baseUrl);
        this.headers = options?.headers || {};
        this.methods = options?.methods?.length
            ? options.methods
            : RestManager.defaultMethods;

        this.routers = new Map();
        this.request = options?.request;
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

        this.routers.set(name, RestManager.router(this.baseUrl + path, {
            headers: headers && typeof headers === 'object'
                ? Object.assign(this.headers, headers)
                : this.headers,
            methods: this.methods,
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

    private static isURL(url: string) {
        let result: URL;

        if (typeof url !== 'string') return false;
        try { result = new URL(url); }
        catch (_) { return false; }

        return ['http:', 'https:'].includes(result.protocol);
    }

    /**
     * @static
     * @private
     * @param url URL to be formatted
     * @returns Formatted URL
     */
    private static formatURL(url: string) {
        url = url.split('/').filter(Boolean).join('/');
        return new URL(url).toString();
    }

    /**
     * @static
     * @param url URL to create a route
     * @param options Request body configuration
     * @returns Object manipulator {@link https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Proxy Proxy}
     */
    public static create<K extends Methods>(url: string, options?: RestManagerOptions<K>) {
        return this.router(url, {
            methods: options?.methods || options?.methods?.length
                ? options.methods
                : this.defaultMethods,
            headers: options?.methods,
            request: options?.request
        });
    }

    /**
     * @private
     * @static
     * @param url Endpoint URL to create a manager
     * @param options Request body configuration
     * @returns Object manipulator {@link https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Proxy Proxy}
     */
    private static router<K extends Methods>(url: string, options: RestManagerOptions<K>) {
        if (!url || !this.isURL(url)) throw new Error('You did not provide a valid URL');
        if (options?.methods && !options.methods.filter(v => this.defaultMethods.includes(v)).length) throw new Error('Requisition method not supported or defined');
        if (options?.headers && typeof options.headers !== 'object') throw new Error('The header has to be the object type');
        if (options?.request && typeof options.request !== 'function') throw new Error('The "Request" property has to be a function');

        const baseUrl = new URL(
            new URL(RestManager.formatURL(url)).origin +
            new URL(RestManager.formatURL(url)).pathname.replace(/\/\//gi, '')
        ).toString(),
            params = new URL(RestManager.formatURL(url)).searchParams,
            routes: string[] = [];

        const handler = {
            get(target: any, key: string) {
                if (options.methods!.includes(key as K)) return (data: any) => RestManager.makeRequest(key as Methods, data, {
                    baseUrl,
                    params,
                    routes,
                    headers: options.headers,
                    request: options.request
                });

                routes.push(key);
                return new Proxy<RecursiveRouter<MethodsFunctions, K>>(target, handler);
            },

            apply(target: any, _: unknown, args: any[]) {
                args.filter(Boolean).forEach((data, index) => {
                    if (typeof data === 'object' && !Array.isArray(data)) {
                        for (let [key, value] of Object.entries(data)) params.append(key, value as any);
                        return;
                    }

                    Array.isArray(data)
                        ? routes.push(...data)
                        : routes.push(data);
                });

                return new Proxy<RecursiveRouter<MethodsFunctions, K>>(target, handler);
            }
        };

        return new Proxy<RecursiveRouter<MethodsFunctions, K>>((() => { }) as any, handler);
    }

    /**
     * @param method Requisition method
     * @param data Requisition body
     * @param options Requisition body options
     * @returns The result of the request
     */
    private static async makeRequest(method: Methods, data: any, options: RequestOptions) {
        let headers: any = options.headers ?? {},
            url = RestManager.formatURL(options.baseUrl + ('/' + options.routes.join('/')));

        if (options.params.toString().length) url += `?${options.params.toString()}`;
        if (data && typeof data == 'object' && data?.headers) {
            Object.assign(headers, data.headers ?? {});
            delete data.headers;
        }

        if (!options?.request) return fetch(new URL(url).toString(), { method, headers, ...(data ?? {}) });
        return await options.request(url, method, { headers, ...(data ?? {}) });
    }
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

export type RecursiveRouter<T, K extends keyof T> = {
    (...args: any[]): RecursiveRouter<T, K>;
}
    & { [P in K]: T[P] }
    & { [k: string]: RecursiveRouter<T, K> }

export interface RestManagerOptions<K = never> {
    headers?: object;
    methods?: K[] | Methods[];
    request?: (url: string, method: Methods, data: any) => Promise<any> | any;
}