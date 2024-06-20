/**
 * @module src/plugin
 */

const ws = require('ws');
const HandlerCollector = require('./collector');

/**
 * This class needs to be registered as plugin in the Mocks Server configuration.
 * 
 * @see {@link https://www.mocks-server.org/docs/plugins/installation/}
 */
class WebsocketPlugin {
    /**
     * The plugin ID. @type {string} @public
     */
    static get id() {
        return 'websocket';
    }

    /**
     * Creates a new plugin instance. @param {Core} core - The Mocks Server core object.
     */
    constructor(core) {
        core.logger.info('Load plugin Websockets');

        /**
         * The plugin proxy object. @type {Object} @private
         */
        this._pluginProxy = this._generatePluginProxy(core);

        /**
         * The handler registry option.
         * Here you can register Handler classes in the mocks-server config.
         * To do this, use the plugins section and the plugin ID.
         * The handler key must be set to an object that contains a mapping from the path to the associated handler class.
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
         * @type {Option}
         * @private
         */
        this._handlerOption = core.config.addOption({
            name: 'handler',
            type: 'object',
            default: {}
        });

        /**
         * The websocket server instance. @type {!ws.Server} @private
         */
        this._wsServer = null;

        /**
         * The handler collector instance. @type {!HandlerCollector} @private
         */
        this._handlerCollector = null;
    }

    /**
     * Initializes the plugin.
     */
    init() {
        this._wsServer = new ws.Server({noServer: true});
        this._handlerCollector = new HandlerCollector(this._handlerOption.value);

        this._wsServer.on('connection', (socket, request) => {
            const socketProxy = this._generateSocketProxy(socket, request)
            const handler = this._handlerCollector.createHandler(request.url, socketProxy, this._pluginProxy);

            // Captures the handler object to handle message events.
            socket.on('message', message => {
                handler.onMessage(message);

            });
            // Captures the handler object to handle close events.
            socket.on('close', () => {
                handler.onClose();
                this._handlerCollector.deleteHandler(handler);
            });
        });
    }

    /**
     * Starts the plugin. @param {Core} core - The Mocks Server core object.
     */
    start(core) {
        core.server._server.on('upgrade', (request, socket, head) => {
            if (request.headers['upgrade'] === 'websocket') {
                this._wsServer.handleUpgrade(request, socket, head, socket => {
                    this._wsServer.emit('connection', socket, request);
                })
            }
        });
    }

    /**
     * A proxy object with encapsulated methods to access socket functionalities.
     * 
     * @typedef {Object} socketProxy
     * @property {string} url - The socket URL.
     */

    /**
     * Generates a proxy object with encapsulated methods to access socket functionalities.
     * 
     * @param {Socket} socket - The websocket instance.
     * @param {Request} request - The request object.
     * @returns {socketProxy}
     */
    _generateSocketProxy(socket, request) {
        return {
            get url() {
                return request.url;
            },
            /**
             * Sends a message to the client. @param {string} message - The message to send.
             */
            sendMessage: message => {
                socket.send(message);
            }
        };
    }

    /**
     * Generates a proxy object with encapsulated methods to access plugin functionalities, like logging ect.
     * 
     * @param {Core} core - The Mocks Server core object.
     * @returns {Object} 
     */
    _generatePluginProxy(core) {
        return {
            /**
             * Logs a message with info level. @param {string} message - The message to log.
             */
            logInfo(message) {
                core.logger.info(message);
            },

            /**
             * Logs a message with warning level. @param {string} message - The message to log.
             */
            logWarning(message) {
                core.logger.warn(message);
            },

            /**
             * Logs a message with error level. @param {string} message - The message to log.
             */
            logError(message) {
                core.logger.error(message);
            },

            /**
             * Logs a message with verbose level. @param {string} message - The message to log.
             */
            logVerbose(message) {
                core.logger.verbose(message);
            },

            /**
             * Logs a message with debug level. @param {string} message - The message to log.
             */
            logDebug(message) {
                core.logger.debug(message);
            },

            /**
             * Logs a message with silly level. @param {string} message - The message to log.
             */
            logSilly(message) {
                core.logger.silly(message);
            },
        };
    }
}

module.exports = WebsocketPlugin;