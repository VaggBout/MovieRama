/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    coverageReporters: ["html", "lcov", "text"],
    coverageDirectory: "<rootDir>/coverage",
    transform: {
        "^.+\\.ts": "ts-jest",
    },
    testPathIgnorePatterns: ["<rootDir>/node_modules/"],
    modulePathIgnorePatterns: ["<rootDir>/dist"],
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};
