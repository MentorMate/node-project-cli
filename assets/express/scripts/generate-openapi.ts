// register extensions as the very first thing in the entry point
import '@extensions/zod/register';
import '@extensions/knex/register';

import { writeFileSync } from 'fs';
import { resolve } from 'path';

import { envSchema } from '@common/environment';
import { create as createApp } from '@app/app';


const run = async () => {
  const env = Object.freeze(envSchema.parse(process.env));

  const { createOpenAPIDocument } = createApp(env);

  const document = createOpenAPIDocument();
  const file = resolve(__dirname, '..', '.openapi', 'openapi.json');
  const data = JSON.stringify(document, null, 2);

  writeFileSync(file, data);

  return file;
}

run()
  .then(console.log)
  .catch(console.error);
