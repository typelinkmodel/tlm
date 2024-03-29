import { ILoader, Loader } from "../../src";

class UnsupportiveDelegate implements ILoader {
  loadFile(_filename: string): Promise<void> {
    throw new Error("not called");
  }

  supportsExtension(_extension: string): boolean {
    return false;
  }
}

class NoopDelegate implements ILoader {
  loadFile(_filename: string): Promise<void> {
    return Promise.resolve();
  }

  supportsExtension(extension: string): boolean {
    return extension === "tlmd";
  }
}

class ErrorDelegate implements ILoader {
  loadFile(_filename: string): Promise<void> {
    throw new Error("test error");
  }

  supportsExtension(_extension: string): boolean {
    return true;
  }
}

const unsupportive = new UnsupportiveDelegate();
const noop = new NoopDelegate();
const error = new ErrorDelegate();

test("Loader supports plugging in delegate loaders", () => {
  const loader = new Loader([unsupportive, noop]);
  expect(loader.supportsExtension("tlmd")).toBe(true);
});

test("Loader can exist without delegates", () => {
  const loader = new Loader();
  expect(loader.supportsExtension("tlmd")).toBe(false);
});

test("Loader without delegates cannot load files", async () => {
  const loader = new Loader();
  await expect(async () => {
    await loader.loadFile("foo.tlmd");
  }).rejects.toThrowError(/file type/);
});

test("Loader for file without extension", async () => {
  const loader = new Loader();
  await expect(async () => {
    await loader.loadFile("foo");
  }).rejects.toThrowError(/file type/);

  await expect(async () => {
    await loader.loadFile("foo.");
  }).rejects.toThrowError(/file type/);

  await expect(async () => {
    await loader.loadFile("");
  }).rejects.toThrowError(/file type/);

  await expect(async () => {
    await loader.loadFile(null as unknown as string);
  }).rejects.toThrowError(/file type/);
});

test("Loader delegates loadFile", async () => {
  // no support, error
  let loader = new Loader([]);
  await expect(async () => {
    await loader.loadFile("foo.tlmd");
  }).rejects.toThrowError(/file type/);

  // noop, no error
  loader = new Loader([unsupportive, noop, error]);
  await loader.loadFile(".././bar/foo.tlmd");

  // error!
  loader = new Loader([unsupportive, error, noop]);
  await expect(async () => {
    await loader.loadFile("foo.tlmd");
  }).rejects.toThrowError(/test error/);
});
