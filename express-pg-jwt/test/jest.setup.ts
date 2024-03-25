import '@extensions/zod/register';
import '@extensions/knex/register';

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({
  path: path.resolve(process.cwd(), '.env.test'),
  override: true,
});
