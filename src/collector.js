/**
 * @module src/collector
 */

/**
 * Manages all registered and currently active handler objects.
 */
class HandlerCollector {
    /**
     * Constructs a new collector object.
     * It receives a registry object, which contains relative paths mapped to the Handler objects.
     * 
     * @param {Object.<string, BaseHandler.constructor>} handlerRegistry - The handler registry object.
     */
    constructor(handlerRegistry) {
        /**
         * Internal reference to the handler registry.
         * 
         * @type {Object.<string, BaseHandler.constructor>}
         * @private
         */
        this._handlerRegistry = handlerRegistry;

        /**
         * Contains all handlers that currently have active WebSockets.
         * If a websocket establishes a connection, the newly created handler will be added to the handler array.
         * When a websocket is closed, it is removed from the handler array.
         * 
         * @type {Array.<BaseHandler>}
         * @private
         */
        this._handler = [];
    }

    /**
     * Creates a new websocket handler based on the given URL and returns it.
     * If no handler is registered to this URL, an error will be thrown.
     * 
     * The method needs to additional parameters:
     *  - A proxy object to access the underlying websocket object.
     *  - A proxy object to access plugin functionalities, like logging ect.
     * 
     * @see module:src/plugin._generateSocketApi
     * @see module:src/plugin._generatePluginApi
     * 
     * @param {string} url - The URL the Handler is registered to.
     * @param {Object} socketProxy - The proxy object to access the websocket
     * @param {Object} pluginProxy - The proxy object to access the plugin.
     * 
     * @throws {Error} Thrown if no handler is registered to the given URL.
     * @returns {BaseHandler} The newly created handler.
     */
    createHandler(url, socketProxy, pluginProxy) {
        const HandlerClass = this._handlerRegistry[url];
        if (! HandlerClass) {
            throw new Error(`Websocket Handler for the URL ${url} doesn't exist!`);
        }
        const handler = new HandlerClass(socketProxy, this, pluginProxy);
        this._handler.push(handler);

        return handler;
    }

    /**
     * Removes a handler object from the collector.
     * 
     * @param {BaseHandler} handler - The handler to delete.
     */
    deleteHandler(handler) {
        const index = this._handler.findIndex(hnd => hnd === handler);
        this._handler.splice(index, 1);
    }

    /**
     * Callback function which receives a handler instance.
     * 
     * @callback handlerCallback
     * @param {BaseHandler} handler
     */

    /**
     * Applies a callback on handler in the collector.
     * Can be used to broadcast, ect...
     * 
     * @param {handlerCallback} callback 
     */
    applyAll(callback) {
        this._handler.forEach(handler => {
            callback(handler);
        });
    }
}

module.exports = HandlerCollector;