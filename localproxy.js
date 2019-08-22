const http = require('http');

let registeredApps = {};

function getBody(req, cb) {
  body = [];
  req.on('error', (err) => {
    console.error(err);
  }).on('data', (chunk) => {
    body.push(chunk);
  }).on('end', () => {
    body = Buffer.concat(body).toString();
    cb(body);
  });
}

function proxyRequest(req, res, route, app) {
  const pxyreq = http.request({
    port: app.port,
    host: '127.0.0.1',
    method: req.method,
    path: req.url,
    headers: req.headers,
  })
  pxyreq.addListener('response', function (pxyres) {
    pxyres.addListener('data', function(chunk) {
      console.log(chunk);
      res.write(chunk, 'binary');
    });
    pxyres.addListener('end', function() {
      res.end();
    });
    res.writeHead(pxyres.statusCode, pxyres.headers);
  });
  req.addListener('data', function(chunk) {
    pxyreq.write(chunk, 'binary');
    
  });
  req.addListener('end', function() {
    pxyreq.end();
  });
}

function registerProxyRoute(req, res) {
  console.log("proxy registration");
  getBody(req, body => {
    const payload = JSON.parse(body);
    registeredApps[payload.app] = payload;
    res.end();
  });
}

function unregisterProxyRoute(req, res) {
  console.log("proxy unregistration");
  getBody(req, body => {
    const payload = JSON.parse(body);
    delete registeredApps[payload.app];
    res.end();
  });
}

function listProxyRoutes(req, res) {
  if (Object.values(registeredApps).length !== 0) {
    res.write(JSON.stringify(Object.values(registeredApps))); //write a response to the client
    res.end(); //end the response
  } else {
    res.write('No routes, just right!'); //write a response to the client
    res.end(); //end the response
  }
}

http.createServer(function (req, res) {
  console.log(`request for ${req.url}`);

  if (req.url === "/PROXY_ROUTES") {
    if (req.method === "GET") {
      listProxyRoutes(req, res);
      return;
    } else if (req.method === "POST") {
      registerProxyRoute(req, res);
      return;
    } else if (req.method === "DELETE") {
      unregisterProxyRoute(req, res);
      return;
    }
  }

  for (app of Object.values(registeredApps)) {
    for (route of app.routes) {
      if (req.url.match(route)) {
        console.log(`route ${route} for app ${app.app} matches!`);
        proxyRequest(req, res, route, app);
        return;
      }
    }
  }

  listProxyRoutes(req, res);
  return;
}).listen(8080); //the server object listens on port 8080

