# Mocks-Server Websocket Plugin
This is a plugin for the Mocks-Server project to add Websocket functionality. Please read the [Mocks-Server Documentation](https://www.mocks-server.org/) before proceeding.

## Description
The plugin extends the functionality of the Mocks-Server so that WebSocket connections can be used within the application. This has the advantage over a separate WebSocket test server that resources can be shared and WebSockets can be accessed from middleware variants. To achieve this, the plugin provides central management of all existing socket connections, which can be accessed from anywhere in the application.

This software is currently in a very early stage and has not been fully tested. Bugs are to be expected! The functionality is still limited, but meets the requirements to successfully close the gap between WebSockets and your Mock-API.

## Installation
To install the plugin, run the following command:

```text
npm install -D mocksserver-ws-plugin
```

Detailed instructions about the installation process can be found [here](https://www.mocks-server.org/docs/installation/).

## Basic Usage
> **NOTE:** If you are new to the Mocks Server project, I highly recommend reading the complete [Mocks-Server Documentation](https://www.mocks-server.org/docs/overview/) first!

On the first run the Mocks-Server will create a configuration file. We need this file later to register the plugin and the handler classes. More information about this can be found in the [quick start guide](https://www.mocks-server.org/docs/quick-start/).

Connections are established using handler classes. A handler object is associated with a route. To create a simple handler class, just extend the ``BaseHandler`` from the plugin package. The only method you must implement is the ``onMessage`` method, which is called when a message arrive:

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
The above handler simply acts as an echo server, which sends the incoming message back to the client with the additional text ``Message from the client:``.

Now we can register the plugin and the handler class in the configuration file. The class reference must be assigned to the route. This is the relative path where the WebSocket is provided by the server.

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

After starting the server, the handler can be reached at the following URL:
```text
ws://<host>:<port>/foo
```

To test this, we can write a simple client script:

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
Each handler object has a reference to the handler collector, which manages the handler objects. At the moment the collector provides two methods to access other handlers: ``applyOn`` and ``applyAll``. With ``applyOn`` it is possible to call a function on all handlers connected to a specific path.

For example, say you want to send a message received by a handler connected at ``/foo`` to all clients of another handlers connected at ``/bar``. To do this you can use the following code snippet:

```javascript
class FooHandler extends BaseHandler {
  onMessage(message) {
    this.collector.applyOn('/bar', barHandler => {
      barHandler.writeMessage(`Message received by FooHandler: ${message}`)
    });
  }
}
```

If you want to perform an action on all handlers currently connected (e.g. for a broadcast) it is possible to use the ``applyAll`` method. It receives just a callback method without the path:

```javascript
class FooHandler extends BaseHandler {
  onMessage(message) {
    this.collector.applyAll(handler => {
      handler.writeMessage(`Message received by FooHandler: ${message}`)
    });
  }
}
```

If you want to access the collector elsewhere in the program, for example in a middleware variant, you can do so via the ``instance`` property of the plugin class. The instance exposes the collector property named as ``handlerCollector``. The following code snippet shows how to send a POST-Message received by a middleware variant to a WebSocket handler connected at the route ``/foo``:

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

For more information about using middleware variants, see the [documentation](https://www.mocks-server.org/docs/usage/variants/middleware/).

## More information
If you want to learn more about this plugin, please read the source code. Every functionality is very well described via JSDoc.

## Copyright and license
The project is written and documented by Oliver Huckfeldt &copy; 2024. Code and documentation is released under MIT-License.