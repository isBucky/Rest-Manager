'use strict';

const { isURL, isDirectory, isEmptyDirectory } = require('bucky.js'),
  path = require('node:path');
  
/**
 * Class used to configure rest-manager.
 * @class RestManager
 */
class RestManager {
  /**
   * Use to configure rest-manager.
   * 
   * @params {Object} [options] Settings options.
   * @params {String} [options.endpoint]
   * @params {String} [options.framework]
   * @params {Function} [options.request]
   * @params {Object} [options.headers]
   * @params {Array} [options.methods]
   * 
   * @returns {Object}
   */
  constructor(options) {
    if (!('endpoint' in options) || !isURL(options?.endpoint)) throw new Error('You have not defined a valid base URL!');
    
    if (!('framework' in options) || !options.framework) throw new Error('You haven\'t defined a valid framework!');
    if (!isDirectory(path.resolve(__dirname, '..', options.framework)) ||
      isEmptyDirectory(path.resolve(__dirname, '..', options.framework))) throw new Error(`The framework "${options.framework}" is not installed in this project!`);
      
    if (('request' in options) && typeof options.request !== 'function') throw new Error('The "request" option is not a function!');
    
    let framework = require(options.framework);
    return new Proxy(this.builderRouter(options, framework), this.handler);
  }
  
  /**
   * 
   * @param {Object} [options]
   * @param {String} [framework]
   * @returns {Function<object>}
   */
  builderRouter(options, framework) {
    return Object.defineProperties(function Router() {}, {
      /**
       * 
       * @type {Syring}
       */
      endpoint: { value: new URL(options.endpoint).origin, enumerable: true },
      
      /**
       * 
       * @type {Array}
       */
      routes: { value: [], enumerable: true },
      resolveResquest: { value: this.resolveResquest },
      
      /**
       * 
       * @type {Object}
       */
      headers: { value: options.headers ?? {} },
      
      /**
       * 
       * @type {Function}
       */
      request: { value: options.request },
      handler: { value: this.handler },
      
      /**
       * 
       * @type {String}
       */
      framework: { value: framework },
      
      /**
       * 
       * @type {Array}
       */
      reflectors: {
        value: [
          'toString', 'valueOf',
          'inspect', 'constructor',
          Symbol.toPrimitive,
          Symbol.for('nodejs.util.inspect.custom'),
        ]
      },
      
      /**
       * 
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
   * 
   * @returns {Object}
   * @readonly
   */
  get handler() {
    return {
      get(target, key) {
        if (target?.[key]) return target[key];
        if (target.reflectors.includes(key)) return () => `${target.endpoint}/${target.routes.join('/')}`.split('/?').join('?');
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
   * 
   * @param {Object} [target]
   * @param {String} [method]
   * @returns {Function}
   */
  resolveResquest(target, method) {
    let
      url = `${target.endpoint}/${target.routes.join('/')}`.split('/?').join('?'),
      headers = target.headers;
      
    return !target.request
      ? (data) => {
        if (typeof data == 'object' && ('headers' in data)) Object.assign(headers, data.headers);
        if (data?.headers) delete data.headers;
        return target.framework({ url, method, headers, ...data });
      }
      
      : (data) => target.request(target.framework, method, url, data);
  }
}

exports.RestManager = RestManager;