import baseConfig from "./jest.config.base.js";

export default {
  ...baseConfig,
  projects: ["packages/*"],
};
