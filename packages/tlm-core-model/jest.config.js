module.exports = {
    transform: {
        "^.+\\.ts$": "ts-jest"
    },
    testRegex: "(\\.|/)(test|spec)\\.ts$",
    moduleFileExtensions: [
        "ts",
        "js",
        "json"
    ],
    collectCoverage: true,
    coverageDirectory: "coverage",
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    },
    globals: {
        'ts-jest': {
            packageJson: 'package.json'
        }
    }
};
