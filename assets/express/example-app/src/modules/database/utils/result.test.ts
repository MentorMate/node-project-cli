import { first, parseCount } from './result';

describe('first', () => {
  it('should return the first record in an array', () => {
    expect(first([1, 2, 3])).toBe(1);
    expect(first([])).toBe(undefined);
  });
});

describe('parseCount', () => {
  it('should extract and parse the count when the count is a string', () => {
    expect(parseCount([{ count: '10' }])).toBe(10);
  });

  it('should extract the count when the count is a number', () => {
    expect(parseCount([{ count: 10 }])).toBe(10);
  });
});
