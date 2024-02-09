export const axiosMock = {
  post: jest
    .fn()
    .mockImplementation(() =>
      Promise.resolve({ data: { access_token: 'token' } })
    ),
};

export const mockAxios = () => jest.mock('axios', () => axiosMock);
