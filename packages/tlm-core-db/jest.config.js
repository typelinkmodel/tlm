const baseConfig = require("../../jest.config.base");

module.exports = {
  ...baseConfig,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // todo test coverage for TLMD Loader
    './src/loader/tlmd.ts': {
      branches: 40,
      functions: 40,
      lines: 40,
      statements: 40
    }
  },
};
