const ws = require('ws');

/**
 * The main class, which needs to be registered as plugin in the Mocks Server configuration.
 * @see {@link https://www.mocks-server.org/docs/plugins/installation/}
 */
class Plugin {
    /**
     * The plugin ID.
     * @type {string}
     * @public
     */
    static get id() {
        return 'websockets';
    }

    /**
     * Creates a new plugin instance.
     * @param {Object} core - The Mocks Server core object.
     */
    constructor(core) {
        core.logger.info('Load plugin Websockets');

        /**
         * The handler registry.
         * Contains handler classes registered in the plugin configuration.
         * 
         * @type {Array}
         * @private
         */
        this._handlerRegistry = core.config.addOption({
            name: 'handler',
            type: 'object',
            default: {}
        });

        /**
         * The ws server instance.
         * @private
         */
        this._wsServer = new ws.Server({noServer: true});

        /**
         * Contains objects of handler classes that have an active connection.
         * 
         * @private
         * @type {Array}
         */
        this._activeHandler = [];
    }

    /**
     * Initializes the plugin.
     * @param {Object} core - The Mocks Server core object.
     */
    init(core) {
        this._wsServer.on('connection', (socket, request) => {

        const HandlerClass = this._handlerRegistry.value[request.url];
        if (! HandlerClass) {
            core.logger.error(`Websocket Handler for the URL ${request.url} doesn't exist!`);
            return;
        }
        const props = {
            url: request.url,
            handlers: this._activeHandler,
            logger: core.logger
        };
        const handler = new HandlerClass(socket, props);
        this._activeHandler.push(handler);

        socket.on('close', () => {
            handler.onClose();
            const index = this._activeHandler.findIndex(h => h === handler);
            const result = this._activeHandler.splice(index, 1);
            delete result[0];
        });
    
        });
    }

    /**
     * Starts the plugin
     * @param {Object} core - The Mocks Server core object.
     */
    start(core) {
        const server = core.server._server;

        server.on('upgrade', (request, socket, head) => {
            if (request.headers['upgrade'] === 'websocket') {
                this._wsServer.handleUpgrade(request, socket, head, socket => {
                    this._wsServer.emit('connection', socket, request);
                })
            }
        });
    }
}

module.exports = Plugin;