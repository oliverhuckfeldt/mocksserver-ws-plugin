/**
 * Base class for Websocket handler. Every handler class must derive from this class.
 */
class BaseHandler {
    /**
     * Create a new handler class.
     * 
     * @param {Object} socket - The websocket object
     * @param {Object} props - An object containing properties the handler class can use.
     */
    constructor(socket, props) {
        this.props = props;
        this._socket = socket;
        this._socket.on('message', message => {
            this.onMessage(message);
        });
    }

    /**
     * A stub method, which is called when the socket receives a message.
     * Overwrite this method with your own code.
     * 
     * @param {string} message - The message, which was received.
     */
    onMessage(message) {}

    /**
     * A stub method, which is called when the socket closes.
     * Overwrite this method with your own code.
     */
    onClose() {}

    /**
     * Sends a message via the socket to the client.
     * @param {string} message - The message to send.
     */
    writeMessage(message) {
        this._socket.send(message);
    }

    /**
     * Sends a message to all currently open sockets of the plugin.
     * @param {string} message - The message to send.
     */
    broadcast(message) {
        this.props.handlers.forEach(handler => {
            if (handler !== this) {
                handler.writeMessage(message);
            }
        });
    }
}

module.exports = BaseHandler