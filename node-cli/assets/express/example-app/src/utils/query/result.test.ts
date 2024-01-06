import { parseCount } from './result';

describe('parseCount', () => {
  it('should extract and parse the count when the count is a string', () => {
    expect(parseCount([{ count: '10' }])).toBe(10);
  });

  it('should extract the count when the count is a number', () => {
    expect(parseCount([{ count: 10 }])).toBe(10);
  });
});
