global.console = {
    // Ignore logging in tests
    log: jest.fn(),
    warn: jest.fn(),
    // Keep native behaviour for other methods
    error: console.error,
    info: console.info,
    debug: console.debug,
};
