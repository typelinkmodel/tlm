export const mockClientQuery = jest.fn();
export const mockClientRelease = jest.fn();

export const mockClientInstance = {
  query: mockClientQuery,
  release: mockClientRelease,
};

export const mockPoolConnect = jest.fn(() => {
  return mockClientInstance;
});

export const mockPoolInstance = {
  connect: mockPoolConnect,
};

export const mockPoolConstructor = jest.fn(() => {
  return mockPoolInstance;
});

// tslint:disable-next-line:variable-name
export const Pool = mockPoolConstructor;

export function emptyResult(command: string = "") {
  return Promise.resolve({
    command,
    rows: [],
    rowCount: 0,
    oid: 0,
    fields: []
  });
}

export function rowsResults(command: string, rows: any[]) {
  return Promise.resolve({
    command,
    rows,
    rowCount: 0,
    oid: 0,
    fields: []
  });
}
