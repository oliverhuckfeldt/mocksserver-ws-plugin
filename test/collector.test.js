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
});

describe('Handler creation from registry', () => {    
    test('All handler created', () => {
        expect(collector._handler.length).toBe(Object.keys(registry).length);
    });

    test('Handler URL matches URL in registry', () => {
        collector._handler.forEach(handler => {
            expect(Object.keys(registry)).toContain(handler.url);
        });
    });

    test('Handler contains collector reference', () => {
        collector._handler.forEach(handler => {
            expect(handler.collector).toBe(collector);
        });
    });
});

describe('Handler methods', () => {
    test('Call constructor', () => {
        expect(core.logger.info.mock.calls[0][0]).toBe('/foo handler created.');
        expect(core.logger.info.mock.calls[2][0]).toBe('/bar handler created.');
        expect(core.logger.info.mock.calls[4][0]).toBe('/baz handler created.');
    });

    test('Call onConnect', () => {
        expect(core.logger.info.mock.calls[1][0]).toBe('/foo handler connected.');
        expect(core.logger.info.mock.calls[3][0]).toBe('/bar handler connected.');
        expect(core.logger.info.mock.calls[5][0]).toBe('/baz handler connected.');
    });

    test('Call onMessage', () => {
        collector.applyAll(handler => {
            handler.onMessage(`${handler.url} handler message received.`, core);
        });
        expect(core.logger.info.mock.calls[6][0]).toBe('/foo handler message received.');
        expect(core.logger.info.mock.calls[7][0]).toBe('/bar handler message received.');
        expect(core.logger.info.mock.calls[8][0]).toBe('/baz handler message received.');
    });

    test('Call writeMessage', () => {
        collector.applyAll(handler => {
            handler.writeMessage(`${handler.url} handler message send.`);
        });
        expect(socket.send.mock.calls[0][0]).toBe('/foo handler message send.')
        expect(socket.send.mock.calls[1][0]).toBe('/bar handler message send.')
        expect(socket.send.mock.calls[2][0]).toBe('/baz handler message send.')
    });

    test('Call onClose', () => {
        collector.applyAll(handler => {
            handler.onClose(core);
        });
        expect(core.logger.info.mock.calls[6][0]).toBe('/foo handler closed.');
        expect(core.logger.info.mock.calls[7][0]).toBe('/bar handler closed.');
        expect(core.logger.info.mock.calls[8][0]).toBe('/baz handler closed.');
    });
});
