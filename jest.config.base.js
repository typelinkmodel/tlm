let config = {
    transform: {
        "^.+\\.ts$": "ts-jest"
    },
    testRegex: "(\\.|/)(test|spec)\\.ts$",
    moduleFileExtensions: [
        "ts",
        "js",
        "json"
    ]
};

const debug = typeof v8debug === 'object'
    || /--debug|--inspect/.test(process.execArgv.join(' '))
    || /--debug|--inspect/.test(process.argv.join(' '));

if (!debug) {
    config = {
        ...config,
        collectCoverage: true,
        coverageDirectory: "coverage",
        coverageThreshold: {
            global: {
                branches: 80,
                functions: 80,
                lines: 80,
                statements: 80
            }
        }
    };
}

module.exports = config;
