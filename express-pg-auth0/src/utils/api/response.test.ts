import { ZodString, ZodObject } from 'zod';
import { response } from './response';

describe('response', () => {
  describe('NoContent', () => {
    it('should be an OpenAPI response without content', () => {
      const noContent = response.NoContent;
      expect(noContent).toHaveProperty('description');
      expect(noContent).not.toHaveProperty('content');
    });
  });

  describe('NotFound', () => {
    it('should return a zod schema for an error', () => {
      const schema = response.NotFound;
      expect(schema).toBeInstanceOf(ZodObject);
      expect(schema.shape.message).toBeInstanceOf(ZodString);
      const error = { message: 'error' };
      expect(schema.parse(error)).toEqual(error);
    });
  });

  describe('Conflict', () => {
    it('should return a zod schema for an error', () => {
      const schema = response.Conflict;
      expect(schema).toBeInstanceOf(ZodObject);
      expect(schema.shape.message).toBeInstanceOf(ZodString);
      const error = { message: 'error' };
      expect(schema.parse(error)).toEqual(error);
    });
  });

  describe('UnprocessableEntity', () => {
    it('should return a zod schema for an error', () => {
      const schema = response.UnprocessableEntity;
      expect(schema).toBeInstanceOf(ZodObject);
      expect(schema.shape.message).toBeInstanceOf(ZodString);
      const error = { message: 'error', errors: [] };
      expect(schema.parse(error)).toEqual(error);
    });
  });

  describe('Unauthorized', () => {
    it('should return a zod schema for an error', () => {
      const schema = response.Unauthorized;
      expect(schema).toBeInstanceOf(ZodObject);
      expect(schema.shape.message).toBeInstanceOf(ZodString);
      const error = { message: 'error' };
      expect(schema.parse(error)).toEqual(error);
    });
  });
});
