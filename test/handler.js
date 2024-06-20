const BaseHandler = require('../src/handler');

class Handler extends BaseHandler {
    constructor(socketProxy, collector, pluginProxy) {
        super(socketProxy, collector, pluginProxy);
        this.pluginProxy.logInfo(`${this.url} handler created.`);
    }

    onMessage(message) {
        this.pluginProxy.logInfo(message);
    }

    onClose() {
        this.pluginProxy.logInfo(`${this.url} handler closed.`);
    }

    broadcast() {
        this.collector.applyAll(handler => {
            handler.writeMessage(`${this.url} broadcast to ${handler.url}.`);
        });
    }
}

module.exports = Handler;