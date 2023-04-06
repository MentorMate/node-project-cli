import { RequestHandler } from 'express';

const route: RequestHandler = (_req, res) => {
  res.send('Hello, World!');
};

export default route;
