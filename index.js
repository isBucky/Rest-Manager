'use strict';

/**
 * Rest manager constructor class.
 * @class RestManager
 */
class RestManager {
    /**
     * Use to configure your rest manager configuration.
     * 
     * @params {Object} [options] Settings options.
     * @params {String} [options.baseURL] Where does the URL begin.
     * @params {Object} [options.headers] Header configuration.
     * @params {Array} [options.methods] What methods are possible to use in request.
     * 
     * @returns {Object} Returns the rest manager's constructor class.
     * 
     * To find out read the readme {@link README.md}
     */
    constructor(options) {
        if (!('baseURL' in options) || !this.isURL(options?.baseURL)) throw new Error('You have not defined a valid base URL!');
        return new Proxy(this.builderRouter(options), this.handler);
    }

    /**
     * Function used to build the routes.
     * 
     * @param {Object} [options] Options defined in the class's constructor.
     * @param {String} [framework] Lib/framework defined in settings options.
     * 
     * @returns {Function<object>} Returns a function with values 
     */
    builderRouter(options) {
        return Object.defineProperties(function Router() { }, {
            /**
             * This is the base URL, where to start the requests.
             * @type {String}
             */
            baseURL: {
                value: new URL(options.baseURL).origin
                    + new URL(options.baseURL).pathname.replace(/\/\//gi, '')
                    + (new URL(options.baseURL).searchParams.toString().length
                        ? `?${new URL(options.baseURL).searchParams.toString()}` : ''),
                enumerable: true
            },

            /**
             * Use to get the current URL.
             * 
             * @type {Getter}
             * @returns {String}
             */
            currentURL: {
                get: function CurrentURL() {
                    return `${this.baseURL + this.routes.join('/')}`.split('/?').join('?');
                },
                enumerable: true
            },

            /**
             * Here all the selected routes will be listed.
             * @type {Array}
             */
            routes: { value: [], enumerable: true },
            resolveResquest: { value: this.resolveResquest },

            /**
             * Headers you defined for your application.
             * @type {Object}
             */
            headers: { value: options.headers ?? {} },

            /**
             * Function you defined for a modified request.
             * @type {Function}
             */
            handler: { value: this.handler },
            reflectors: {
                value: [
                    'toString', 'valueOf',
                    'inspect', 'constructor',
                    Symbol.toPrimitive,
                    Symbol.for('nodejs.util.inspect.custom'),
                ]
            },

            /**
             * Configured or default request methods.
             * @type {Array}
             */
            methods: {
                value: (!Array.isArray(options?.methods) ||
                    !options?.methods.length)
                    ? ['get', 'post', 'delete', 'put']
                    : options.methods,
                enumerable: true
            }
        });
    }

    /**
     * Function used to handle the routes.
     * @returns {Object}
     * @readonly
     */
    get handler() {
        return {
            get(target, key) {
                if (target?.[key]) return target[key];
                if (target.reflectors.includes(key)) return () => target.currentURL;
                if (target.methods.includes(key)) return target.resolveResquest(target, key);

                target.routes.push(key);
                return new Proxy(target, target.handler);
            },

            apply(target, _, args) {
                args.filter(Boolean).forEach((data, index) => {
                    let isObject = typeof data == 'object';
                    if (isObject && index == 0) return target.routes.push('?' + new URLSearchParams(data).toString());
                    if (isObject && index > 0) return;

                    return Array.isArray(data)
                        ? target.routes.push(...data)
                        : target.routes.push(data);
                });

                return new Proxy(target, target.handler);
            }
        }
    }

    /**
     * Function used to resolve the final request.
     * 
     * @param {Object} [target]Object returned from buildeRouter function
     * @param {String} [method] Request method.
     * @returns {Function} Returns a function that can be passed other parameters of the request.
     */
    resolveResquest(target, method) {
        let url = target.currentURL;
        if (target.routes.length) target.routes.splice(0);

        return async (data) => {
            if (typeof data == 'object' && ('headers' in data)) Object.assign(headers, data.headers);
            if (data?.headers) Object.assign(target.headers ?? {}, data.headers);

            return await fetch(url, {
                method,
                headers: target.headers,
                ...data
            });
        };
    }

    isURL(link) {
        let result;

        if (typeof link !== 'string') return false;
        try { result = new URL(link); }
        catch (_) { return false; }

        return ['http:', 'https:'].includes(result.protocol);
    }
}

module.exports = RestManager;