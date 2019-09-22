import { foo, hello } from "../src";

test("tlm-core-model", async () => {
    expect(hello).toBe("Hello, World!");

    expect(foo()).toBe("foo");

    expect(true);
});
