<div align="center">
    <h1 style="font-weight: 600">Rest-Manager</h1>
    <div>
        <a href="https://www.npmjs.com/package/rest-manager">
            <img src="https://img.shields.io/npm/v/rest-manager?style=flat-square&maxAge=3600" alt="NPM version" />
        </a>
        <a href="https://www.npmjs.com/package/rest-manager">
            <img src="https://img.shields.io/npm/dt/rest-manager?style=flat-square&maxAge=3600" alt="NPM downloads" />
        </a>
        <a href="https://www.npmjs.com/package/rest-manager">
            <img src="https://img.shields.io/github/languages/code-size/isBucky/Rest-Manager?style=flat-square&maxAge=3600" alt="NPM size" />
        </a>
        <a href="https://www.npmjs.com/package/rest-manager">
            <img src="https://img.shields.io/npm/l/rest-manager?style=flat-square&maxAge=3600" alt="NPM license" />
        </a>
    </div>
    <p style="font-size: 1.1em"><strong>A framework in order to facilitate/handle requests to a URL in an easy way.</strong></p>
</div>

---

# Installation:
~~~sh
npm install rest-manager
~~~

# Introduction:
> By default is NPM already uses the native Nodejs fetch
~~~javascript
// Supports ES6 and CommonJs on import.
import RestManager from 'rest-manager';

// Configuring client.
const RestClient = RestManager({
  baseUrl: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'password123'
  },
  methods: ['get', 'post']
});

(async() => {
  // Get: http://localhost:3000/api/users?id=5
  let response = await RestClient.users({ id: 5 }).get(),
    { data } = await response.json();

  return console.log(data);
})();
~~~

# [Client settings options](./index.js#L25):
~~~javascript
const client = RestManager({
    // This will be the base URL for making requests.
    baseUrl: 'http://localhost:3000/api',
    
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

    // This function allows you to manage the request returning 3 parameters, being:
    // Router: is the body of the Restmanager;
    // Method: is the method of request;
    // BodyRequest: As it says in the name, it is the body of the request.
    request(router, method, bodyRequest) {}
});
~~~

# Making requests:
> **There are several ways to make requests, for example:**

### Do a simple get:
~~~javascript
(async() => {
  // Get: http://localhost:3000/api/users
  let response = await RestClient.users.get(),
    { data } = await response.json();
  
  return console.log(data);
})();
~~~

### Including queries:
> **To include queries in requests, just use objects:**

~~~javascript
(async() => {
  // Get: http://localhost:3000/api/users?id=5
  let response = await RestClient.users({ id: 5 }).get(),
    { data } = await response.json();
  
  return console.log(data);
})();
~~~

### External values:
> **You can add external values using parentheses:**

~~~javascript
(async() => {
  // Get: http://localhost:3000/api/users/5
  let userId = 5,
    response = await RestClient.users(userId).get(),
    { data } = await response.json();
    
  return console.log(data);
})();
~~~

### Adding more options:
> **You can set more options at request time, passing an object in the request method:**

~~~javascript
(async() => {
  // Post: http://localhost:3000/api/newUser
  let response = await RestClient.newUser.post({
        headers: { /*...*/ },
        body: { /*...*/ }
    }),
    { data } = await response.json();
  
  return console.log(data);
})();
~~~

### Modifying the request:
> **You can modify the request according to your taste, even use other librarys:**

~~~javascript
(async() => {
    import undici from 'undici';

    const RestClient = RestManager({
        baseUrl: 'http://localhost:3000/api',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'password123'
        },

        // Here I am using the Undici library to make the requests from this client
        request(router, method, bodyRequest) {
            return undici.fetch(router.url, { method, ...bodyRequest });
        }
    });
})();
~~~