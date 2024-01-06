import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ObjectId } from 'mongodb';

@Injectable()
export class ToObjectIdPipe implements PipeTransform<any, ObjectId> {
  public transform(value: any): ObjectId {
    try {
      return new ObjectId(value);
    } catch (err) {
      throw new BadRequestException('Invalid Id format');
    }
  }
}
