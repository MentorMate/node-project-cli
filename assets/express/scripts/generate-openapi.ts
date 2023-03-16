// register extensions as the very first thing in the entry point
import '@extensions/zod/register';
import '@extensions/knex/register';

import pino from 'pino';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

import { envSchema } from '@common/environment';
import { registry } from '@modules';
import { initializeKnex } from '../src/database/initilize-knex';
import createDbRepos from '@database';
import apiDefinitionFactory from '@api';
import { generateDocument } from '@common/openapi';

const run = async () => {
  const env = Object.freeze(envSchema.parse(process.env));

  const logger = pino({
    name: 'http',
    ...(env.NODE_ENV !== 'production' && {
      transport: {
        target: 'pino-pretty',
        colorize: false,
      },
    }),
  });

  const knex = initializeKnex(logger);
  const dbRepositories = createDbRepos(knex);
  const routes = apiDefinitionFactory(dbRepositories);

  const document = generateDocument(registry, '3.0.3', routes);
  document.servers = [{ url: `http://localhost:${env.PORT}` }];

  const file = resolve(__dirname, '..', '.openapi', 'openapi.json');
  const data = JSON.stringify(document, null, 2);

  writeFileSync(file, data);

  return file;
};

run().then(console.log).catch(console.error);
