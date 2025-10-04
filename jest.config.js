import config from "./jest.config.base.js";

export default {
  ...config,
  projects: ["packages/*"],
};
