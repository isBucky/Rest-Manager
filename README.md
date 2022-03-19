<div align="center">
  <h1>Rest-Manager</h1>
  <p>
    <a href="https://www.npmjs.com/package/rest-manager"><img src="https://img.shields.io/npm/v/rest-manager?style=flat-square&maxAge=3600" alt="NPM version" /></a>
    <a href="https://www.npmjs.com/package/rest-manager"><img src="https://img.shields.io/npm/dt/rest-manager?style=flat-square&maxAge=3600" alt="NPM downloads" /></a>
    <a href="https://www.npmjs.com/package/rest-manager"><img src="https://img.shields.io/github/languages/code-size/isBucky/Rest-Manager?style=flat-square&maxAge=3600" alt="NPM size" /></a>
    <a href="https://www.npmjs.com/package/rest-manager"><img src="https://img.shields.io/npm/l/rest-manager?style=flat-square&maxAge=3600" alt="NPM license" /></a>
  </p>
  <p><strong>A framework in order to facilitate/handle requests to a URL in an easy way.</strong></p>
</div>

---

# Installation:
~~~sh
# Using npm:
npm install rest-manager --save

# Using yarn:
yarn add rest-manager
~~~

# Introduction:
~~~javascript
// Supports ES6 and CommonJs on import.
import RestManager from 'rest-manager';

const RestClient = new RestManager({
  framework: 'axios',
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'password123'
  },
  methods: ['get', 'post']
});

(async() => {
  let { data } = await RestClient.users({ id: 5 }).get();
  return console.log(data);
})();
~~~