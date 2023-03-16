import '../src/extensions/zod/register';
import '../src/extensions/knex/register';

import pino from 'pino';
import { envSchema } from '../src/common';

import { initApplication } from '../src/app'
import { writeFileSync } from 'fs';
import { resolve } from 'path';

const run = async () => {
  const env = envSchema.parse(process.env);

  const logger = pino({
    name: 'http',
    ...(env.NODE_ENV !== 'production' && {
      transport: {
        target: 'pino-pretty',
        colorize: false,
      },
    }),
  });

  const { createOpenAPIDocument } = await initApplication(logger);

  const document = createOpenAPIDocument();
  const file = resolve(__dirname, '..', '.openapi', 'openapi.json');
  const data = JSON.stringify(document, null, 2);

  writeFileSync(file, data);

  return file;
}

run()
  .then(console.log)
  .catch(console.error);
