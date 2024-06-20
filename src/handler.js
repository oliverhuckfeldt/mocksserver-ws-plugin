/**
 * @module src/handler
 */

/**
 * Base class for a websocket handler.
 * Every handler class you create must derive from this class.
 */
class BaseHandler {
    /**
     * Creates a new handler class.
     * 
     * Each handler need three dependencies when created:
     *  - A proxy object to access the underlying websocket object.
     *  - A reference to the handler collector.
     *  - A proxy object to access plugin functionalities, like logging ect.
     * 
     * The dependencies are injected by the handler collector automatically, when the handler is created.
     * If you are overwriting the constructor, don't forget to pass the dependencies to the super constructor.
     * 
     * @param {Object} socketProxy - The proxy object to access the websocket.
     * @param {HandlerCollector} collector - A reference to the handler collector.
     * @param {Object} pluginProxy - The proxy object to access the plugin.
     */
    constructor(socketProxy, collector, pluginProxy) {
        /**
         * The socket proxy object.
         * @type {Object}
         * @private
         */
        this._socketProxy = socketProxy;

        /**
         * The plugin proxy.
         * @type {Object}
         */
        this.pluginProxy = pluginProxy;

        /**
         * The collector reference.
         * @type {HandlerCollector}
         */
        this.collector = collector;
    }

    /**
     * The URL the socket is linked to. @type {string}
     */
    get url() {
        return this._socketProxy.url;
    }

    /**
     * A stub method that needs to be overridden.
     * It is called when the socket receives a message from the client.
     * 
     * @param {string} message - The message that was received from the client.
     */
    onMessage(message) {}

    /**
     * A stub method that needs to be overridden.
     * It is called when the socket is closed.
     */
    onClose() {}

    /**
     * Sends a message to the client
     * 
     * @param {string} message - The message.
     */
    writeMessage(message) {
        this._socketProxy.sendMessage(message);
    }
}

module.exports = BaseHandler