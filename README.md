# localproxy
Dynamically run multiple web applications on routes on http://localhost:80.

Capable of mounting static routes or proxying requests to other servers.

## Install
1. Make user `localproxy`
2. Install nginx
3. Disable default site for nginx (`sudo rm /etc/nginx/sites-enabled/default`)
4. `touch /etc/nginx/conf.d/localproxy.conf`
5. `chown localproxy /etc/nginx/conf.d/localproxy.conf`
9. TODO figure out a way to get localproxy user to reload nginx without sudo to simplify the install and run
10. `npm install`
11. `sudo node ./server.js` (TODO have this run as localproxy)
12. TODO how to get this to run on startup

## Usage

Send API requests to `/__proxy__/api`.

While processing a `POST` or `DELETE` request, the nginx config will be immediately updated. 

### `GET`

Get requests will simply return the list of currently installed proxy apps

Response: `App[]`

### `POST`

Post requests will install a proxy app. Note that this will overwrite any other apps 

Request Payload: `InstallRequest`
Response: none

### `DELETE`

Delete requests will uninstall a proxy app

Request Payload: `DeleteRequest`
Response: none

## Types

```ts
// TODO Note that the exact specifics of StaticRoute and ProxyRoute are still being worked out...

// This route will serve requests from the filesystem
type StaticRoute = {
  static: true,
  route: string, // the route to mount the filesystem server atThis should not end with a trailing slash
  staticDir: string, // the directory on the filesystem to mount. Must end with a trailing slash
}

// This route will proxy requests to a destination server
type ProxyRoute = {
  static: false,
  route: string, // the route to mount the destination server at. This should not end with a trailing slash
  hostname: string, // the hostname of the destination server
  port: number // the port of the destination server
  trimRoute: boolean // whether to trim the route or not before passing to the destination server
}

type Route = ProxyRoute | StaticRoute

type App = {
  id: string // A Unique ID for this app
  routes: Route[]
}

type InstallRequest = App

type DeleteRequest = {
  id: string // The ID of the app to uninstall
}
```