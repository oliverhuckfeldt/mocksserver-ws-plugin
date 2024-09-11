const Handler = require('./handler');
const HandlerCollector = require('../src/collector');

const core = {
    logger: {
        info: jest.fn(message => message)
    }
};

const socket = {
    send: jest.fn(message => message)
};

const registry = {
    '/foo': Handler,
    '/bar': Handler,
    '/baz': Handler
};

let collector;

beforeEach(() => {
    collector = new HandlerCollector(registry);
    Object.keys(registry).forEach(path => {
        const handler = collector._createHandler(path, socket, core);
        handler.onConnect(core);
    });
});

afterEach(() => {
    core.logger.info.mockClear();
    socket.send.mockClear();
});

describe('Successful handler creation', () => {    
    test('All handler created', () => {
        expect(collector._handler).toHaveLength(Object.keys(registry).length);
    });

    test('All registered URLs present', () => {
        Object.keys(registry).forEach(url => {
            expect(collector._handler.some(h => h.url === url))
        });
    });
    
    test('All handlers have a collector reference', () => {
        collector._handler.forEach(handler => {
            expect(handler.collector).toBe(collector);
        });
    });
    
    test('Multiple handlers with same URL', () => {
        collector._createHandler('/foo', socket, core);
        collector._createHandler('/foo', socket, core);

        const fooHandlers = collector._handler.filter(h => h.url === '/foo')
        expect(fooHandlers).toHaveLength(3);
    });
});

describe('Handler methods', () => {
    test('Call constructor', () => {
        expect(core.logger.info.mock.calls).toHaveLength(6);
        expect(core.logger.info.mock.calls[0][0]).toBe('/foo handler created.');
        expect(core.logger.info.mock.calls[2][0]).toBe('/bar handler created.');
        expect(core.logger.info.mock.calls[4][0]).toBe('/baz handler created.');
    });

    test('Call onConnect', () => {
        expect(core.logger.info.mock.calls).toHaveLength(6);
        expect(core.logger.info.mock.calls[1][0]).toBe('/foo handler connected.');
        expect(core.logger.info.mock.calls[3][0]).toBe('/bar handler connected.');
        expect(core.logger.info.mock.calls[5][0]).toBe('/baz handler connected.');
    });

    test('Call onMessage', () => {
        collector._handler.forEach(handler => {
            handler.onMessage(`${handler.url} handler message received.`, core);
        });
        expect(core.logger.info.mock.calls).toHaveLength(9);
        expect(core.logger.info.mock.calls[6][0]).toBe('/foo handler message received.');
        expect(core.logger.info.mock.calls[7][0]).toBe('/bar handler message received.');
        expect(core.logger.info.mock.calls[8][0]).toBe('/baz handler message received.');
    });

    test('Call writeMessage', () => {
        collector._handler.forEach(handler => {
            handler.writeMessage(`${handler.url} handler message send.`);
        });
        expect(socket.send.mock.calls).toHaveLength(3);
        expect(socket.send.mock.calls[0][0]).toBe('/foo handler message send.');
        expect(socket.send.mock.calls[1][0]).toBe('/bar handler message send.');
        expect(socket.send.mock.calls[2][0]).toBe('/baz handler message send.');
    });

    test('Call onClose', () => {
        collector._handler.forEach(handler => {
            handler.onClose(core);
        });
        expect(core.logger.info.mock.calls).toHaveLength(9);
        expect(core.logger.info.mock.calls[6][0]).toBe('/foo handler closed.');
        expect(core.logger.info.mock.calls[7][0]).toBe('/bar handler closed.');
        expect(core.logger.info.mock.calls[8][0]).toBe('/baz handler closed.');
    });
});

describe('Collector API', () => {
    test('Use applyAll', () => {
        collector.applyAll(handler => {
            handler.writeMessage(`${handler.url} handler called by applyAll.`);
        });
        expect(socket.send.mock.calls).toHaveLength(3);
        expect(socket.send.mock.calls[0][0]).toBe('/foo handler called by applyAll.');
        expect(socket.send.mock.calls[1][0]).toBe('/bar handler called by applyAll.');
        expect(socket.send.mock.calls[2][0]).toBe('/baz handler called by applyAll.');
    });

    test('Use applyOn', () => {
        collector.applyOn('/foo', handler => {
            handler.writeMessage(`${handler.url} handler called by applyOn.`);
        });
        expect(socket.send.mock.calls).toHaveLength(1);
        expect(socket.send.mock.calls[0][0]).toBe('/foo handler called by applyOn.');
    });

    test('Use applyOn multiple', () => {
        collector._createHandler('/foo', socket, core);
        collector._createHandler('/foo', socket, core);

        collector.applyOn('/foo', handler => {
            handler.writeMessage(`${handler.url} handler called by applyOn.`);
        });
        expect(socket.send.mock.calls).toHaveLength(3);
        expect(socket.send.mock.calls[0][0]).toBe('/foo handler called by applyOn.');
        expect(socket.send.mock.calls[1][0]).toBe('/foo handler called by applyOn.');
        expect(socket.send.mock.calls[2][0]).toBe('/foo handler called by applyOn.');
    });
});