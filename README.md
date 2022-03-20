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

// Configuring client.
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
  // Get: http://localhost:3000/api/users?id=5
  let { data } = await RestClient.users({ id: 5 }).get();
  return console.log(data);
})();
~~~

# [Client settings options](./index.js#L25):
~~~javascript
const client = new RestManager({
  // Here it will be defined which lib/framework you will use to make the request.
  framework: 'axios',
  
  // This will be the base URL for making requests.
  baseURL: 'http://localhost:3000/api',
  
  // Here will be the headers of your request.
  headers: {
    'Content-Type': 'application/json',
    Authorization: '123'
  },
  
  /**
   * Here you can configure which request methods are available.
   * By default comes the following methods: get, post, delete and put.
   */
  methods: [ 'get', 'post' ],
  
  /**
   * You can use this function to manage your request.
   * You will only use this function if your chosen lib/framework is not compatible with the axios or node-fetch request settings.
   * This function is called before executing the request.
   */
  request(framework, url, method, headers, data) {/*...*/}
});
~~~

# Making requests:
> **There are several ways to make requests, for example:**

### Do a simple get:
~~~javascript
(async() => {
  // Get: http://localhost:3000/api/users
  let { data } = await RestClient.users.get();
  return console.log(data);
})();
~~~

### Including queries:
> **To include queries in requests, just use objects:**

~~~javascript
(async() => {
  // Get: http://localhost:3000/api/users?id=5
  let { data } = await RestClient.users({ id: 5 }).get();
  return console.log(data);
})();
~~~

### External values:
> **You can add external values using parentheses:**

~~~javascript
(async() => {
  // Get: http://localhost:3000/api/users/5
  let { data } = await RestClient.users(5).get();
  return console.log(data);
})();
~~~

### Adding more options:
> **You can set more options at request time, passing an object in the request method:**

~~~javascript
(async() => {
  // Post: http://localhost:3000/api/newUser
  let { data } = await RestClient.newUser.post({
    headers: { /*...*/ },
    data: { /*...*/ }
  });
  
  return console.log(data);
})();
~~~