import { RecordNotFound } from './record-not-found';

describe('RecordNotFound', () => {
  it('should have a default message', () => {
    const error = new RecordNotFound();
    expect(error.message.length).toBeGreaterThan(0);
  });
});
