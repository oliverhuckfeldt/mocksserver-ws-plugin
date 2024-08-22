# Mocks-Server Websocket Plugin

This is a plugin for the [Mocks-Server](https://www.mocks-server.org/) project to add Websocket functionality.

## Description

The Mocks-Server project is a HTTP-Mock-Server to simulate Web-APIs. With this plugin the server can also manage Websocket connections. Connections were managed with the help of handler classes. A Handler class is mapped to a route.

## Installation

To install the plugin, run the following command:

```text
npm install -D mocksserver-ws-plugin
```

Detailed installation instructions can be found [here](https://www.mocks-server.org/docs/installation/).

## Basic Usage
On the first run the Mocks-Server will create a configuration file. We need this file to register the plugin and the handler classes later. Please visit this [link](https://www.mocks-server.org/docs/quick-start/) to view the quick start guide.

Now create a simple handler class by extending the BaseHandler, The only method you need to implement is the ``onMessage()`` method, which is called when messages arrive.:

```javascript
// handler.js
const { BaseHandler } = require('mocksserver-ws-plugin');

class FooHandler extends BaseHandler {
  onMessage(message) {
    this.writeMessage(`Message from the client: ${message}`)
  }
}

module.exports = FooHandler
```
The above handler simply acts as an echo server, which sends the incoming message back to the client with the addition ``Message from the client:``.

Now we can register the plugin and the handler class in the configuration file. The handler class must be made available together with the relative path as a key-value pair in the handler attribute. This is the path at which the websocket can be connected.

```javascript
// mocks.config.js
const { WebsocketPlugin } = require('mocksserver-ws-plugin');
const FooHandler = require('./handler');

module.exports = {
  // ...
  plugins: {
    // Register the plugin
    register: [WebsocketPlugin],
    websocket: {
      // Register the handler class 
      handler: {
        '/foo': FooHandler
      }
    },
    // ...
  },
  // ...
};
```

After starting the server, the handler can be contacted at the following URL:
```text
ws://<host>:<port>/foo
```

To test this, write a simple client script:

```javascript
// client.js
const { Websocket } = require('ws');

const ws = new WebSocket('ws://<host>:<port>/foo');
ws.on('open', () => {
    ws.send('Hello from client.');
});
ws.on('message', message => {
    console.log(`Server said: ${message}`);
});
```

The program will print ``Server said: Message from the client: Hello from client.`` in the console.

## Advanced usage

In case you want to access other handlers, each Handler object has a reference to the Handler collector. To do this, you need the relative path under which the handler is registered. You cannot access the handler directly. Instead, there are two methods to pass callbacks to the collector: ``applyOn`` and ``applyAll``.

For example, if you want to send a message received by a handler registered at ``/foo`` through another handler registered at ``/bar``, you can use the following code snippet:

```javascript
class FooHandler extends BaseHandler {
  onMessage(message) {
    this.collector.applyOn('/bar', barHandler => {
      barHandler.writeMessage(`Message received by FooHandler: ${message}`)
    });
  }
}
```

If you want to perform an action on all handlers, e.g. for a broadcast, it is possible to use the "applyAll" method. The callback method that you pass there is applied to all handlers in the collector. The following code snippet illustrates how a received message is sent by all handlers in the collector to their clients:

```javascript
class FooHandler extends BaseHandler {
  onMessage(message) {
    this.collector.applyAll(handler => {
      handler.writeMessage(`Message received by FooHandler: ${message}`)
    });
  }
}
```

If you want to access the collector elsewhere in the program, for example in a middleware, you can do so via the ``Instance`` property of the plugin class. The instance exposes the handlerCollector property. This code snippet shows how to send a POST-Message received by a middleware to a WebSocket handler registered at the relative path ``/foo``:

```javascript
// mocks/routes/<route-name>.js

const { WebsocketPlugin } = require('mocksserver-ws-plugin')

module.exports = [
  {
    // ...
    method: "POST",
    variants: [
      {
        // ...
        type: "middleware",
        options: {
          middleware: (request) => {         
            const wsPlugin = WebsocketPlugin.instance;
            const { message } = request.body;

            wsPlugin.handlerCollector.applyOn('/foo', fooHandler => {
              fooHandler.writeMessage(`Message received by middleware: ${message}`);
            });

            // ...
          },
        },
      }
    ],
  }
];
```

## Copyright and license

The project is written and documented by Oliver Huckfeldt &copy; 2024. Code and documentation is released under MIT-License.