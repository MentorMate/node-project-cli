import { DuplicateRecord } from './duplicate-record';

describe('DuplicateRecord', () => {
  it('should have a default message', () => {
    const error = new DuplicateRecord();
    expect(error.message.length).toBeGreaterThan(0);
  });
});
