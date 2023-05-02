// register extensions as the very first thing in the entry point
import '@extensions/zod/register';

import { writeFileSync } from 'fs';
import { resolve } from 'path';

import { envSchema } from '@common/environment';
import { routes } from '@api';
import { RouteDefinition } from '@common/api';
import { getDocumentGenerator } from '@common/openapi';

const run = async () => {
  const env = Object.freeze(envSchema.parse(process.env));

  const generator = getDocumentGenerator('3.0.3', routes as RouteDefinition[]);

  const document = generator.generateDocument({
    info: {
      version: '1.0.0',
      title: 'To-Do',
      description: 'A To-Do application API',
    },
    servers: [{ url: `http://localhost:${env.PORT}` }],
  });

  const file = resolve(__dirname, '..', '.openapi', 'openapi.json');
  const data = JSON.stringify(document, null, 2);

  writeFileSync(file, data);

  return file;
};

run().then(console.log).catch(console.error);
