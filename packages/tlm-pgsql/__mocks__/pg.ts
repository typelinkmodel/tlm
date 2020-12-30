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
