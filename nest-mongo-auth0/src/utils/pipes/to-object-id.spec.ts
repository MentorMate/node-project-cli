import { BadRequestException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { ToObjectIdPipe } from './to-object-id';

describe('To ObjectId Pipe', () => {
  let pipe: ToObjectIdPipe;
  beforeEach(() => {
    pipe = new ToObjectIdPipe();
  });

  it('converts the value to ObjectId when the input is of valid type', () => {
    const strObjectId = new ObjectId();

    expect(pipe.transform(strObjectId)).toEqual(strObjectId);
  });

  it('throws an error when the input is of invalid type', () => {
    expect(() => pipe.transform('test')).toThrow(
      new BadRequestException('Invalid Id format')
    );
  });
});
