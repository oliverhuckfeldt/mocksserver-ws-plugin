const pluginApiMock = {
    logInfo: jest.fn(message => message)
};

function generateSocketApiMock(url) {
    return {
        get url() {
            return url;
        },

        sendMessage: jest.fn(message => message)
    };
}

module.exports = {
    pluginApiMock,
    generateSocketApiMock
};