/**
 * @module src/handler
 */

/**
 * Base class for a websocket handler.
 * Every custom handler class must be derived from this class.
 */
class BaseHandler {
    /**
     * Creates a new handler class.
     * 
     * Each handler need two dependencies when created:
     *  - The relative URL at which the websocket can be accessed.
     *    The URL can be accessed via the url attribute.
     * 
     *  - A reference to the Mocks-Server core object.
     *    This reference is stored in a private _core attribute.
     * 
     * The dependencies are injected by the handler collector when the handler is created.
     * When overriding the constructor of a custom handler, the dependencies must be passed to the super constructor.
     * 
     * @param {string} url - The websocket URL.
     * @param {Object} core - The Mocks-Server core reference.
     */
    constructor(url, core) {
        /**
         * The websocket URL.
         * 
         * @type {string}
         * @private
         */
        this._url = url;

        /**
         * The core object reference.
         * 
         * @type {Object}
         * @private
         */
        this._core = core;

        /**
         * The websocket object.
         * 
         * @type {?ws.WebSocket}
         * @private
         * */
        this._socket = null;

        /**
         * The handler collector object reference.
         * 
         * @type {?HandlerCollector}
         * @private
         */
        this._collector = null;
    }

    /**
     * Sets a WebSocket reference to the handler object.
     * This is done by the handler collector at initialization time.
     * The socket can only be set once. Further calls have no effect.
     * 
     * @param {ws.WebSocket} socket - A websocket object.
     */
    _setSocket(socket) {
        this._socket = this._socket || socket;
    }
    
    /**
     * Sets a collector reference to the handler object.
     * This is done by the handler collector at initialization time.
     * The socket can only be set once. Further calls have no effect.
     * 
     * @param {HandlerCollector} collector - The handler collector reference.
     */
    _setCollector(collector) {
        this._collector = this._collector || collector;
    }

    /** The relative URL the socket is linked to. @type {string} */
    get url() {
        return this._url;
    }
    
    /** The handler collector reference. @type {HandlerCollector} */
    get collector() {
        return this._collector;
    }

    /**
     * This is a stub method that can be overridden.
     * It is called when the socket receives a message from the client.
     * The method receives a core reference from the Mocks-Server.
     * 
     * @param {string} message - The message that was received from the client.
     * @param {Object} core - The Mocks-Server core reference.
     */
    onMessage(message, core) {}

    /**
     * This is a stub method that can be overridden.
     * It is called when the socket is closed.
     * The method receives a core reference from the Mocks-Server.
     * 
     * @param {Object} core - The Mocks-Server core reference.
     */
    onClose(core) {}

    /**
     * This is a stub method that can be overridden.
     * It is called at connection time immediately after the handler is created.
     * The method receives a core reference from the Mocks-Server.
     * 
     * @param {Object} core - The Mocks-Server core reference.
     */
    onConnect(core) {}

    /**
     * Sends a message to the client.
     * 
     * @param {string} message - The message to send.
     */
    writeMessage(message) {
        this._socket.send(message);
    }
}

module.exports = BaseHandler