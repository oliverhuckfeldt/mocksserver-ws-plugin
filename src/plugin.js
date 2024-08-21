/**
 * @module src/plugin
 */

const ws = require('ws');
const HandlerCollector = require('./collector');

/**
 * This is the websocket plugin class.
 * It must be registered as a plugin in the Mocks server configuration.
 * 
 * @see {@link https://www.mocks-server.org/docs/plugins/installation/}
 */
class WebsocketPlugin {
    /**
     * The instance attribute.
     * 
     * @type {?WebsocketPlugin}
     * @private
     */
    static _instance = null;

    /**
     * The plugin ID.
     * 
     * @see {@link https://www.mocks-server.org/docs/plugins/development/#plugin-id}
     * @type {string}
     */
    static get id() {
        return 'websocket';
    }

    /**
     * The public plugin instance.
     * This attribute allows the plugin to be accessed from any location in the running server, e.g. in the middleware.
     * 
     * @type {?WebsocketPlugin}
     */
	static get instance() {
		return this._instance;
	}

    /**
     * Creates a new plugin instance.
     * 
     * @see {@link https://www.mocks-server.org/docs/plugins/development/#constructorcore}
     * @param {Object} core - The Mocks Server core object.
     */
    constructor(core) {
        /**
         * The handler registry option.
         * The register handler classes specified in the mock server configuration are stored here.
         * This is done in the plugin section of the configuration under the WebSocket command in the handler attribute.
         * The handler key must be set to an object that contains a mapping from the relative path to the associated handler class.
         * 
         * An example configuration looks like this:
         * 
         * plugins: {
         *   websocket: {
         *     handler: {
         *       "/path": HandlerClass,
         *       ...
         *     }
         *   }
         * }
         * 
         * @type {Object}
         * @private
         */
        this._handlerOption = core.config.addOption({
            name: 'handler',
            type: 'object',
            default: {}
        });

        /**
         * The websocket server instance.
         * 
         * @type {?ws.Server}
         * @private
         */
        this._wsServer = null;

        /**
         * The handler collector instance.
         * 
         * @type {?HandlerCollector}
         * @private
         */
        this._handlerCollector = null;
	
        // Assign the own object to the static instance attribute.
		this.constructor._instance = this;
        core.logger.info('Plugin Websockets created.');
    }

    /**
     * The public handler collector instance.
     * 
     * @type {?HandlerCollector}
     */
    get handlerCollector() {
        return this._handlerCollector;
    }

    /**
     * Initializes the plugin.
     * Creates a new websocket server instance and prepares the socket for receiving lifecycle events.
     * 
     * @see {@link https://www.mocks-server.org/docs/plugins/development/#initcore}
     * @param {Object} core - The Mocks Server core object.
     * @
     */
    init(core) {
        this._wsServer = new ws.Server({noServer: true});
        this._handlerCollector = new HandlerCollector(this._handlerOption.value);

        this._wsServer.on('connection', (socket, request) => {
            const handler = this._handlerCollector._createHandler(request.url, socket, core);
            handler.onConnect(core);

            socket.on('message', message => {
                handler.onMessage(message, core);
            });
            socket.on('close', () => {
                handler.onClose(core);
                this._handlerCollector._deleteHandler(handler);
            });
        });
        core.logger.info('Plugin Websockets initialized.');
    }

    /**
     * Starts the plugin.
     * Prepares the underlying server to upgrade an incoming connection to websocket protocol.
     * 
     * @see {@link https://www.mocks-server.org/docs/plugins/development/#startcore}
     * @param {Object} core - The Mocks Server core object.
     */
    start(core) {
        core.server._server.on('upgrade', (request, socket, head) => {
            if (request.headers['upgrade'] === 'websocket') {
                this._wsServer.handleUpgrade(request, socket, head, socket => {
                    this._wsServer.emit('connection', socket, request);
                })
            }
        });
        core.logger.info('Plugin Websockets started.');
    }

    /**
     * Stops the plugin.
     * 
     * @see {@link https://www.mocks-server.org/docs/plugins/development/#stopcore}
     * @param {Object} core 
     */
    stop(core) {
        core.logger.info('Plugin Websockets stopped.');
    }
}

module.exports = WebsocketPlugin;