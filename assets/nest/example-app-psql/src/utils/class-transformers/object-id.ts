import { BadRequestDto } from '@utils/dtos';
import { Transform } from 'class-transformer';
import { ObjectId } from 'mongodb';

const toObjectId = (v: string) => {
  console.log('TRANSFORMING?');
  try {
    return new ObjectId(v);
  } catch (err) {
    throw new BadRequestDto();
  }
};

export const ToObjectId = () =>
  Transform((params) => toObjectId(params.value), {
    toClassOnly: true,
  });
