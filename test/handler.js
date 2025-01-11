const BaseHandler = require('../src/handler');

class Handler extends BaseHandler {
    constructor(url, core) {
        super(url, core);
        core.logger.info(`${this.url} handler created.`);
    }

    onConnect(core) {
        core.logger.info(`${this.url} handler connected.`);
    }

    onMessage(message, core) {
        core.logger.info(message);
    }

    onJsonMessage(obj, core) {
        core.logger.info(obj);
    }

    onClose(core) {
        core.logger.info(`${this.url} handler closed.`);
    }
}

module.exports = Handler;