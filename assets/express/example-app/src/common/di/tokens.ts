import { Environment } from '@common/environment';
import { Knex } from 'knex';
import { Token } from 'typedi';

export const ENV = new Token<Environment>();
export const DB_CLIENT = new Token<Knex>();
