import baseConfig from "../../jest.config.base.js";

const config = {
  ...baseConfig,
  displayName: "tlm-web",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testPathIgnorePatterns: ["/node_modules/", "/.next/", "/e2e/"],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/.next/",
    "/e2e/",
    "/coverage/",
    "/playwright-report/",
    "/test-results/",
  ],
};

export default config;
