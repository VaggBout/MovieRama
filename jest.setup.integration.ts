import { jest } from "@jest/globals";

global.console = {
    // Ignore logging in tests
    log: jest.fn(),
    warn: jest.fn(),
    error: console.error,
    info: jest.fn(),
    debug: console.debug,
} as unknown as Console;
