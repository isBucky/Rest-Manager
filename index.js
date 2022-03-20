'use strict';

const { isURL, isDirectory, isEmptyDirectory } = require('bucky.js'),
  path = require('node:path');
  
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
   * @params {String} [options.framework] What kind of lib/framework do you want to use.
   * @params {Function} [options.request] Use this function to define what the request will look like.
   * @params {Object} [options.headers] Header configuration.
   * @params {Array} [options.methods] What methods are possible to use in request.
   * 
   * @returns {Object} Returns the rest manager's constructor class.
   * 
   * To find out read the readme {@link README.md}
   */
  constructor(options) {
    if (!('baseURL' in options) || !isURL(options?.baseURL)) throw new Error('You have not defined a valid base URL!');
    
    if (!('framework' in options) || !options.framework) throw new Error('You haven\'t defined a valid framework!');
    if (!isDirectory(path.resolve(__dirname, '..', options.framework)) ||
      isEmptyDirectory(path.resolve(__dirname, '..', options.framework))) throw new Error(`The framework "${options.framework}" is not installed in this project!`);
      
    if (('request' in options) && typeof options.request !== 'function') throw new Error('The "request" option is not a function!');
    
    let framework = require(options.framework);
    return new Proxy(this.builderRouter(options, framework), this.handler);
  }
  
  /**
   * Function used to build the routes.
   * 
   * @param {Object} [options] Options defined in the class's constructor.
   * @param {String} [framework] Lib/framework defined in settings options.
   * 
   * @returns {Function<object>} Returns a function with values 
   */
  builderRouter(options, framework) {
    return Object.defineProperties(function Router() {}, {
      /**
       * This is the base URL, where to start the requests.
       * @type {String}
       */
      baseURL: { value: new URL(options.baseURL).origin, enumerable: true },
      
      /**
       * Use to get the current URL.
       * 
       * @type {Getter}
       * @returns {String}
       */
      currentURL: {
        get: function CurrentURL() {
          return `${this.baseURL}/${this.routes.join('/')}`.split('/?').join('?');
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
      request: { value: options.request },
      handler: { value: this.handler },
      
      /**
       * lib/framework that you defined to make the requests.
       * @type {String}
       */
      framework: { value: framework },
      
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
    
    return !target.request
      ? (data) => {
        if (typeof data == 'object' && ('headers' in data)) Object.assign(headers, data.headers);
        if (data?.headers) delete data.headers;
        return target.framework({
          url, headers: target.headers,
          method, ...data
        });
      }
      
      : (data) => target.request(target.framework, url,
        method, target.headers, data);
  }
}

module.exports = RestManager;