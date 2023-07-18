import request from 'supertest';
import {
  create as createApp,
  expectError,
  getTodoPayload,
  registerUser,
  Unauthorized,
  UnprocessableEntity,
} from '../utils';
import { JwtTokens } from '@api/auth';

describe('POST /v1/todos', () => {
  let app: Express.Application;
  let destroy: () => Promise<void>;
  let jwtTokens: JwtTokens;

  beforeAll(() => {
    const { app: _app, destroy: _destroy } = createApp();
    app = _app;
    destroy = _destroy;
  });

  beforeAll(async () => {
    jwtTokens = await registerUser(app);
  });

  afterAll(async () => {
    await destroy();
  });

  describe('when user is authenticated', () => {
    const todoPayload = getTodoPayload();

    describe('given the todo payload', () => {
      it('should return the created todo', async () => {
        const res = await request(app)
          .post('/v1/todos')
          .set('Authorization', 'Bearer ' + jwtTokens.idToken)
          .send(todoPayload)
          .expect('content-type', /json/)
          .expect(201);

        expect(res.body.name).toEqual(todoPayload.name);
        expect(res.body.note).toEqual(todoPayload.note);
        expect(res.body.completed).toEqual(todoPayload.completed);
      });
    });

    describe('given an empty payload', () => {
      it('should return 422 error', async () => {
        await request(app)
          .post('/v1/todos')
          .send({})
          .set('Authorization', 'Bearer ' + jwtTokens.idToken)
          .expect('content-type', /json/)
          .expect(expectError(UnprocessableEntity));
      });
    });
  });

  describe('when user is not authenticated', () => {
    const todoPayload = getTodoPayload();

    it('should return 401 error', async () => {
      await request(app)
        .post('/v1/todos')
        .send(todoPayload)
        .expect('content-type', /json/)
        .expect(expectError(Unauthorized));
    });
  });
});
