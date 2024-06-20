const Handler = require('./handler');
const HandlerCollector = require('../src/collector');
const { pluginApiMock, generateSocketApiMock } = require('./mocks');

let collector = null;
let socketApiMockFoo = null;
let socketApiMockBar = null;
let socketApiMockBaz = null;

beforeAll(() => {
    collector = new HandlerCollector({
        '/foo': Handler,
        '/bar': Handler,
        '/baz': Handler
    });
    socketApiMockFoo = generateSocketApiMock('/foo');
    socketApiMockBar = generateSocketApiMock('/bar');
    socketApiMockBaz = generateSocketApiMock('/baz');
});

afterEach(() => {
    pluginApiMock.logInfo.mockClear();
    socketApiMockFoo.sendMessage.mockClear();
    socketApiMockBar.sendMessage.mockClear();
    socketApiMockBaz.sendMessage.mockClear();
});

afterAll(() => {
    socketApiMockFoo = null;
    socketApiMockBar = null;
    socketApiMockBaz = null;
});

test('handler broadcast', () => {
    const fooHandler = collector.createHandler('/foo', socketApiMockFoo, pluginApiMock);
    const barHandler = collector.createHandler('/foo', socketApiMockBar, pluginApiMock);
    const bazHandler = collector.createHandler('/foo', socketApiMockBaz, pluginApiMock);

    fooHandler.onMessage(`${fooHandler.url} handler message.`);
    fooHandler.broadcast();

    fooHandler.onClose();
    barHandler.onClose();
    bazHandler.onClose();

    expect(pluginApiMock.logInfo.mock.calls).toHaveLength(7);
    expect(pluginApiMock.logInfo.mock.calls[0][0]).toBe('/foo handler created.');
    expect(pluginApiMock.logInfo.mock.calls[1][0]).toBe('/bar handler created.');
    expect(pluginApiMock.logInfo.mock.calls[2][0]).toBe('/baz handler created.');
    expect(pluginApiMock.logInfo.mock.calls[3][0]).toBe('/foo handler message.');
    expect(pluginApiMock.logInfo.mock.calls[4][0]).toBe('/foo handler closed.');
    expect(pluginApiMock.logInfo.mock.calls[5][0]).toBe('/bar handler closed.');
    expect(pluginApiMock.logInfo.mock.calls[6][0]).toBe('/baz handler closed.');

    expect(socketApiMockFoo.sendMessage.mock.calls).toHaveLength(1);
    expect(socketApiMockBar.sendMessage.mock.calls).toHaveLength(1);
    expect(socketApiMockBaz.sendMessage.mock.calls).toHaveLength(1);
    expect(socketApiMockFoo.sendMessage.mock.calls[0][0]).toBe('/foo broadcast to /foo.');
    expect(socketApiMockBar.sendMessage.mock.calls[0][0]).toBe('/foo broadcast to /bar.');
    expect(socketApiMockBaz.sendMessage.mock.calls[0][0]).toBe('/foo broadcast to /baz.');
});