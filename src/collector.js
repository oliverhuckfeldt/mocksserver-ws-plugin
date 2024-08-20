/**
 * @module src/collector
 */

/**
 * Manages all registered and currently active websocket handler objects.
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
         * The handler registry container.
         * 
         * @type {Object.<string, BaseHandler.constructor>}
         * @private
         */
        this._handlerRegistry = handlerRegistry;

        /**
         * Contains all handlers that currently have active WebSockets.
         * If a websocket establishes a connection, the newly created handler object will be added to the handler array.
         * When a websocket is closed, it is removed from the handler array.
         * 
         * @type {Array.<BaseHandler>}
         * @private
         */
        this._handler = [];
    }

    /**
     * Creates a new handler object based on the given URL and returns it.
     * If no handler is registered to the URL, an error will be thrown.
     * 
     * The method needs three parameters:
     *  - The URL to search the registry for the handler class.
     *  - The socket is passed to the newly created handler.
     *  - The core reference is bound to the handler constructor and some handler methods.
     * 
     * @param {string} url - The URL the handler is registered to.
     * @param {Object} socketProxy - The socket object to which the handler belongs.
     * @param {Object} pluginProxy - The core object of the Mocks-Server.
     * 
     * @throws {Error} Thrown if no handler is registered to the given URL.
     * @returns {BaseHandler} The newly created handler.
     */
    _createHandler(url, socket, core) {
        const HandlerClass = this._handlerRegistry[url];
        if (! HandlerClass) {
            throw new Error(`Websocket Handler for the URL ${url} doesn't exist!`);
        }
        const handler = new HandlerClass(url, core);

        handler._setSocket(socket);
        handler._setCollector(this);

        this._handler.push(handler);
        return handler;
    }

    /**
     * Removes a handler object from the collector.
     * 
     * @param {BaseHandler} handler - The handler to delete.
     */
    _deleteHandler(handler) {
        const index = this._handler.findIndex(hnd => hnd === handler);
        this._handler.splice(index, 1);
    }

    /**
     * A function that receives a handler object.
     * 
     * @callback handlerCallback
     * @param {BaseHandler} handler - The handler object.
     */

    /**
     * Applies a callback function to a handler object registered at this URL.
     * The callback function receives the handler object as a parameter.
     * If no handler is registered ti the URL, an error will be thrown.
     * 
     * @param {string} url - The URL where the handler object is registered.
     * @param {handlerCallback} callback - The function to which the handler object is passed.
     * 
     * @throws {Error} Thrown if no no handler is registered to the URL.
     */

    applyOn(url, callback) {
        const handler = this._handler.find(handler => handler.url === url);
        if (! handler) {
            throw new Error(`Handler object with URL '${url}' not found.`);
        }
        callback(handler);
    }

    /**
     * Applies a callback function to all handler objects in the collector.
     * If the collector contains no objects, no action is performed.
     * 
     * @param {handlerCallback} callback - The function to which the handler objects is passed.
     */
    applyAll(callback) {
        this._handler.forEach(handler => {
            callback(handler);
        });
    }
}

module.exports = HandlerCollector;