## Software philosophy

- All softwares __should try to__ 
- focus on architecture a little more than other things.
- be pluggable
- be non-dependent on its library, any dependency should never try be permanent.
- have a single responsibility for each module and do it well.
- be memory lightweight as possible while still focusing more on getting things done fast.
- bear with the latest practices and security.
- implement a design only when necessary.

## Target

- Static websites, Blogs
- Commercial
- Shopping
- Live Data
- Management
- Data Solution
- Block Chain

## Backend Softwares

- Should be complete and modulated enough so that these kinds of services can be built.
- Basic API with DB backend, and front-end website.
- CMS
- Data Management/Processing
- Native Apps
- PWA

## Practices

### Authentication

- 'user:password' as basic header request allowed only when the connection is TLS/SSL encrypted.
- Using different types of authentication practices to avoid replay attacks. like enc of body into the header to prevent body tampering.
- Implementing the OAuth

# Documentations

This project should simplify the use of express and middlewares for complex projects. Along with prepared snippets of different kinds of services like Mongoose(Mongodb), objectify(MySQL), (Redis) etc.

### Application

The base app is dependent on express instance.

DB implemented:

- 

### Services

A Service is a handler that works on a path. It's middleware processing furthur depends on `Providers[]` that it 

A Service can futhur contain other Services meaning a path containing other sub paths like `/client` containing `/client/stuffs`.

When the chain of middleware is created, a Service prepares the `Request` with `data` object which contain important references and data that `Provider` or other middlewares can use. 

Some important keys are:

- `req.ref.service` is references to the service by which the endpoint was called.
- `req.ref.providerKey` is key of the provider.

Create custom services that inherit directly or indirectly from the `AdapterService` with methods that can modify client data.

Process:
- Service needs to be registered with the app using `useService` which currently accepts only `RouterService`.
- AloeVera will call init on each of these services.
- Any `RouterService` should have `init(AloeVera | Router)`
- `RouterService`'s `init()` will create `express.Router`.
- If needed `Router`s will be created recursively depending on internal services.
- `RouterService` also requires `Provider`s.
- Each `Provider` points to method that should act on a path.
- `Provider`s create express middlewares along with hooks & meta data where required.

#### Recursive Services

Service can also contain inner services which would represent other paths like `/client/more`. From the prespective of expressjs inner services are simply appended paths to its parent path.

example structure.

```json
Service /users
  |
    |\__Service /admin  (appended: /users/admin)
      |
         \__Service /client  (appended: /users/client)
               |
                     |\__Service /merchant  (appended: /contacts/client/merchant)
                           |
                                  \__Service /basic(a|b) (appended: /contacts/client/basica)
  `````

  more example

  ```json
  Service1 -> /users/:id
  Service1.ServiceA -> /read
    request path == /users/:id/read
    `````

    Basically anything from express's path handling technique. Simply put, a single service can handle any type of path naming.

    A child service has reference to it's parent Service and that has reference to it parent and so on.

## Different types of services

### RouterService

#### How RouterService prepares each service

- Router is instanciated once a constructor is called.
- `init` is called by the app whenever service is registered.
- `hasInitialized` will be set to true to indicate that this Service has already created everything neccessary.
- providers will then be initialized.
- if `options.services` is an array then `init` will be called for each of those services using the given Router.
- `router.use` will be called to register the router into the express.

#### How Providers are initialized

- The service hooks are prepared into an array.
- For each provider a special "Service Hook" is created (a middleware). This hook is called before any other hooks.
- Service Hook will assign 'ref', 'data' to 'req' which will collect 'body', 'service' and all required data.
  - `req.data` should contain body, headers, query?
    - `req.ref` should contain service?, success, method?.
      - ??This function should also filter data to make it appropriate to use with different middlewares.??

### DataService

`DataService` is another service extension which simply holds all the references and methods to enable retreiving data from various sources.

`options: { DataService, name  }` where `name` corresponds to the name from the configuration.

### Providers

Each provider is supposed to work for a single 'method' like `POST, GET` etc.
While a Service can contain multiple Providers, each Service represents a path like `/client`. So basically, a Service is the path and providers are method to given path.

A Provider's has `middleware: Function` which is basically another middleware for express for a given path's & method's primary function. It is expected that this middleware should cover fully a Provider should be doing.

A Provider's middleware should expect to get a reference to the service, which it was rendered in, from the `request: Request` as `req.data.service`.


### Hooks

Hooks are basically collection of middlewares. Hooks are useful if you want to repeat middlewares across different Services.

Current hook calling architecture.

```
Service (path)
|
 \__... BeforeHooks
   |
      \____Provider (method)
        ||
          | \____ ... BeforeHooks
            |  |
              |   \___Middleware
                |    |
                  |     \__ ... AfterHooks
                    |
                       \_ ... AfterHooks
                       ```

### Authentication

`auth.service.ts` exists as a basic service at path `/auth` which needs a reference to a `DataService`. 


### Primary Authentication Services

#### `AuthService extends RouterService`

- requires `req` for authentication.
- requires `req.body.type` to determine which type of authentication to procure.
- requires `req.body.auth` is authentication body that will be evaluated depending on `type`.

#### `LocalService extends RouterService`

Is bound to config's `authentication` and the name e.g. `localService`. 

##### What authentication does
- from `req` acquire `data.body`. which should contain body


### Authentication Strategies

`AuthenticationStrategy` provides an interface for any type of authetication which can be used as Service, Middlewares etc. To direct changes to each authentication strategy configs as expected to be provided, which is handled by `configure()` interface.

`AuthenticationStrategy` internally work only with `passport` and thus requires each strategies to register with it. Thus interface `register()` is provided.


#### `LocalStrategy extends AuthenticationStrategy`

This wraps the `passport-local` lib and is initialized with given strategy. The strategy is simply to connect with a given `dataService` and then use find using given id.

- `username`

#### `JWTStrategy extends AuthenticationStrategy`

#### `RefreshStrategy extends AuthenticationStrategy`

## Arch

### `Service`

The main service will prepare hook middlewares and other stuffs for this service 
only. Each service on initialization will create a router and recursively 
initialize all inner services.
By the end of the initialization a router will have been created and assigned 
to, using app's `use` function along with the given baseURI.





                       ```
```
    ````
  ````'
