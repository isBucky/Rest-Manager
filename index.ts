export default function RestManager(options: RestManagerOptions): Router {
    if (!options?.baseUrl || !isUrl(options.baseUrl)) throw new Error('The baseurl property is required. Received: ' + typeof options.baseUrl);
    if (options?.framework && !options.framework?.target) throw new Error('To use a third party framework, you must inform a target. Received: ' + typeof options.framework.target);
    if (options?.framework && !options.framework?.request) throw new Error('To make a request with third party frameworks, you must inform a "Request" function. Received: ' + typeof options.framework.request);
    if (
        options?.framework &&
        options.framework?.request &&
        typeof options.framework?.request !== 'function'
    ) throw new Error('The "Request" property has to be a function. Recorded: ' + typeof options.framework.request);

    const RouterFunction = () => { },
        handler = {
            get(target: Router, key: string) {
                if (key in target) return target[key];
                if (target.methods.includes(key)) return (data: any) => request(target, key, data);

                target.routes.push(key);
                return new Proxy<Router>(target, handler);
            },

            apply(target: Router, _: unknown, args: any[]) {
                args.filter(Boolean).forEach((data, index) => {
                    if (typeof data === 'object' && !Array.isArray(data)) {
                        for (let [key, value] of Object.entries(data)) {
                            target.params.append(key, value as any);
                        }

                        return;
                    }

                    Array.isArray(data)
                        ? target.routes.push(...data)
                        : target.routes.push(data);
                });

                return new Proxy<Router>(target, handler);
            }
        };

    let baseUrl = new URL(options.baseUrl),
        params = baseUrl.searchParams;

    return new Proxy<Router>(Object.defineProperties(RouterFunction as Router, {
        baseUrl: {
            value: new URL(baseUrl.origin + baseUrl.pathname.replace(/\/\//gi, '')).toString(),
            enumerable: true,
            writable: true
        },

        setBaseUrl: {
            value: function setBaseUrl(url: string) {
                if (!isUrl(url)) return false;

                this.baseUrl = url;
                return url;
            },
            enumerable: true
        },

        url: {
            get: function currentURL() {
                let url = this.baseUrl + this.routes.join('/');
                if (this.params.toString().length) url += `?${this.params.toString()}`;

                return new URL(url).toString();
            },
            enumerable: true
        },

        framework: { value: options?.framework ? options.framework : undefined },
        routes: { value: [], enumerable: true },
        params: { value: params, enumerable: true },
        headers: { value: options.headers ?? {} },

        methods: {
            value: !options?.methods ? [
                'get', 'delete',
                'head', 'connect',
                'post', 'options',
                'put', 'trace',
                'patch'
            ] : options.methods
        }
    }), handler);
}

function isUrl(link: string) {
    let result: URL;

    if (typeof link !== 'string') return false;
    try { result = new URL(link); }
    catch (_) { return false; }

    return ['http:', 'https:'].includes(result.protocol);
}

async function request(router: Router, method: string, data: any) {
    if (!router.framework) {
        let bodyRequest: any = { method, headers: router.headers ?? {} };
        if (data && typeof data == 'object' && data?.headers) {
            Object.assign(bodyRequest.headers, data);
            delete data.headers;
        }

        return fetch(router.url, Object.assign(bodyRequest, { ...(data ?? {}) }));
    }

    return await router.framework.request(router, method, data);
}

export interface Framework {
    target: any;
    request: (router: Router, method: string, data: any) => any;
}

export interface RestManagerOptions {
    baseUrl: string;
    headers?: object;
    methods?: string[];
    framework?: Framework;
}

export type Router = {
    (...args: any[]): Router;

    setBaseUrl: (url: string) => string;

    url: string;
    baseUrl: string;
    routes: string[];

    headers: object;
    params: URLSearchParams;
    methods: string[];

    get: (requestBody?: any) => Promise<any>;
    delete: (requestBody?: any) => Promise<any>;
    head: (requestBody?: any) => Promise<any>;
    connect: (requestBody?: any) => Promise<any>;
    post: (requestBody?: any) => Promise<any>;
    options: (requestBody?: any) => Promise<any>;
    put: (requestBody?: any) => Promise<any>;
    trace: (requestBody?: any) => Promise<any>;
    patch: (requestBody?: any) => Promise<any>;

    framework?: Framework;
} & { [key: string]: Router };