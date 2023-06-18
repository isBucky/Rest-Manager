<div align="center">
    <h1>Rest-Manager</h1>
    <div>
        <a href="https://www.npmjs.com/package/rest-manager">
            <img
                src="https://img.shields.io/npm/v/rest-manager?style=flat-square&maxAge=3600"
                alt="NPM version" />
        </a>
        <a href="https://www.npmjs.com/package/rest-manager">
            <img
                src="https://img.shields.io/npm/dt/rest-manager?style=flat-square&maxAge=3600"
                alt="NPM downloads" />
        </a>
        <a href="https://www.npmjs.com/package/rest-manager">
            <img
                src="https://img.shields.io/github/languages/code-size/isBucky/Rest-Manager?style=flat-square&maxAge=3600"
                alt="NPM size" />
        </a>
        <a href="https://www.npmjs.com/package/rest-manager">
            <img
                src="https://img.shields.io/npm/l/rest-manager?style=flat-square&maxAge=3600"
                alt="NPM license" />
        </a>
    </div>
    <p>
        <strong>
            A framework to facilitate/manipulate requests to a URL by creating endpoints for each route.
        </strong>
    </p>
</div>

# Table of contents
- [Installation](#installation)
- [Features](#features)
- [Options and Functions](#options-and-functions)
    - [Class RestManager](#class-restmanager)
        - [Options](#options)
        - [createRouter](#restmanagercreaterouter)
        - [deleteRouter](#restmanagerdeleterouter)
        - [getRouter](#restmanagergetrouter)
    - [Static functions](#static-functions)
        - [create](#restmanagercreate)
- [First steps](#first-steps)
    - [Routes with endpoints](#routes-with-endpoints)
    - [Independent routes](#independent-routes)
- [Creating requisitions](#creating-requisitions)
    - [Query String](#query-string)
    - [Simple Get](#simple-get)
    - [Simple Post](#simple-post)
- [Handling requests](#handling-requests)
    - [Changing values](#changing-values)
    - [Using third-party libraries](#using-third-party-libraries)

# Installation
> **Note** The package already has modules and commonjs support.

Using NPM:
```sh
npm install rest-manager
```

Using yarn:
```sh
yarn add rest-manager
```

Using Pnpm:
```sh
pnpm add rest-manager
```

<!-- ## CDN

JsDelivr:

```html
<script src="https://cdn.jsdelivr.net/npm/rest-manager@3.0.0/dist/index.min.js"></script>

```

Unpkg:

```html
<script src="https://unpkg.com/rest-manager@3.0.0/dist/index.min.js"></script>

``` -->

# Features

- [x] New documentation
- [x] Bugs and errors correction
- [x] Written in TypeScript with dynamic typing  
- [x] Addition of endpoint to static URLs
- [x] New Functions and Code refactored
- [x] Standard requests using native fetch
- [x] Modify the requests according to your taste
- [x] Support for third party libraries
- [ ] CDN support

# Options and Functions

## Class RestManager

### Options

```typescript
import RestManager from 'rest-manager'

// The URL is the basis of all Endpoints requests you create
const rest new RestManager(url: string, {
    // Use to define the request header
    headers?: object;

    // Use to manipulate the request, with it you can use third party libraries to make requests
    // By default we already use the native Nodejs fetch
    request?: (url: string, method: Methods, data: any) => Promise<any> | any;
})
```

### RestManager.createRouter

Use this function to create "endpoints", to learn more look this [**example**](#rotas-com-endpoints).

> **Note** The URL of each route will be defined along with the initial URL of the class.
> For example, I have a URL https://google.com, if you create a route it will be added to the initial URL, it will be like this: https://google.com/ + search = https://google.com/search.

```typescript
/**
 * @param name Identification name for your route
 * @param path The URL path to create Endpoint
 */
rest.createRouter(name: string, path: string, {
    // Use to define the request header
    headers?: object
});
```

### RestManager.deleteRouter

Use this function to delete existing routes.

```typescript
// Name of the route to be deleted, if there is no exist will return false
rest.deleteRouter(name: string);
```

### RestManager.getRouter

Use this function to pull an existing route.

```javascript
// Name of the route to be pulled, if there is no exist will return false
rest.getRouter(name: string);
```

## Static functions

### RestManager.create

Use this function to create an endpoint in a single URL.

> **Note** This function does not perform the same functionality as the [**createRouter**](#restmanagercreaterouter),
> since this function is static, it does not need to run a class.
> However, it will be limited in terms of creating multiple endpoints in a single url.

```javascript
import RestManager from 'rest-manager';

// The url will be the main url of your request
const user = RestManager.create(url: string, {
    // Use to define the request header
    headers?: object;

    // Use it to handle the request, with it you can use third-party libraries to make requests
    // By default we already use NodeJs native Fetch
    request?: (url: string, method: Methods, data: any) => Promise<any> | any;
});
```

# First steps

## Routes with endpoints

```javascript
import RestManager from 'rest-manager';

const api = new RestManager('http://localhost:8080', {
    headers: {
        'Content-Type': 'application/json',
        Authorization: '123'
    }
});

const user = api.createRouter('user', '/user');

(async() => {
    // http://localhost:8080?id=123
    const userResponse = await user({ id: '123' }).get(),
        userData = await userResponse.json();

    // http://localhost:8080/api/users
    api.router.api.users;
    return console.log(userData);
})();
```

## Independent routes

```javascript
import RestManager from 'rest-manager';

const userRouter = RestManager.create('http://localhost:8080/api/user'),
    usersRouter = RestManager.create('http://localhost:8080/api/users');

(async() => {
    // http://localhost:8080?id=123
    const userResponse = await userRouter({ id: '123' }).get(),
        usersRouter = await usersRouter.get();

    const userData = await userResponse.json(),
        usersData = await userResponse.json();

    return console.log(userData, usersData);
})();
```

# Creating requisitions

To add paths to a url is the same thing as pull/access
a value inside an object.

For example if you use it like this:
`router.api.users['123'].dashboard.example` will return like this: `http://localhost:8080/api/users/123/dashboard/example`.

In any request method in the options you can add headers,
if you are using the RestManager class it will assign the additional values in the predefined header.

## Query String 

> **Note** Querys will always be located at the end of a url.

```javascript
// http://localhost:8080/api/users/info?id=123
router.api.users.info({ id: '123' }).get();

// http://localhost:8080/api/search?query=example&max=15
router.api.search({ query: 'example', max: 15 }).get();
```

## Simple Get
```javascript
router.api.users.get();
```

## Simple Post
```javascript
router.api.user.post({
    body: JSON.stringify({
        name: 'isBucky',
        ...
    })
});
```

# Handling requests

Request handling can be used to return a value of
according to your taste, or use third-party libraries to make the requests.

## Changing values
```javascript
import RestManager from 'rest-manager';

const api = new RestManager('http://localhost:8080/api', {
    headers: {
        'Content-Type': 'application/json'
    },
    
    async request(url, method, bodyRequest) {
        const response = await fetch(url, { method, ...bodyRequest });
        
        if (response.headers.get('content-type') === 'application/json') return response.json();
        else return response.text();
    }
});
```

## Using third-party libraries

In this example I will use the [**Undici**](https://www.npmjs.com/package/undici) library to make the requests.

```javascript
import RestManager from 'rest-manager';
import Undici from 'undici';

const api = new RestManager('http://localhost:8080/api', {
    headers: {
        'Content-Type': 'application/json'
    },
        
    async request(url, method, bodyRequest) {
        const { body } = await Undici.request(url, {
                method,
                ...bodyRequest
            });

        return body.json();
    }
});
```

---

[**Back to top**](#)