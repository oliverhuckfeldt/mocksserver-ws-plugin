# Mocks-Server Websocket Plugin

This is a Plugin for the [Mocks-Server](https://www.mocks-server.org/) project to add Websocket functionality.

## Description

The Mocks-Server project is a HTTP-Mock-Server to simulate Web-APIs. With this plugin the server can also manage websocket connections. Connections were managed with the help of handler classes. A Handler class is mapped to a route.

## Installation

To install the plugin, run the following command:

```text
npm install mocksserver-ws-plugin
```

## Usage

To use the plugin, create some handler classes first.

```javascript
// handler.js
const { BaseHandler } = require('mocksserver-ws-plugin');

 class FooHandler extends BaseHandler {
    onMessage(message) {
        this.writeMessage('Message from client: %s', message)
    }
 }

 module.exports = FooHandler
```

Now initialize the mock server.

```javascript
// mock-server.js

const { createServer } = require(@mocks-server/main);
const { WebsocketPlugin } = require('mocksserver-ws-plugin');
const FooHandler = require('./handler');

const server = createServer({
  plugins: {
    register: [WebsocketPlugIn],  // Register the plugin class
    websocket: {
      handler: {'/foo': FooHandler}  // Register handler class
    }
  },

  // ...
});

server.start();
```

Create a client

```javascript
// client.js

const { Websocket } = require('ws');
const ws = new WebSocket('ws://host.com/foo');

ws.on('open', () => {
    ws.send('Hello from client');
});
ws.on('message', message => {
    console.log('Server said: %s', message);
});
```

Start the mock server:

```text
node ./mock-server.js
```

Now start the client:

```text
node ./client.js
```