export const connection = () => ({
  insert,
  where,
});

export const first = jest.fn(() => Promise.resolve({}));

export const returning = jest
  .fn()
  .mockImplementation(() => Promise.resolve([]));

export const where = jest.fn().mockImplementation(() => ({
  first,
}));

export const insert = jest.fn().mockImplementation(() => ({
  returning,
}));

export const mockKnexService = {
  connection,
};
