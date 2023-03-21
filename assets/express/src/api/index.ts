import healtz from './healthz';
import helloWorld from './hello-world';
import v1 from './v1';

export * from './middleware';
export * from './utils';

export const routes = [...helloWorld, ...healtz, ...v1];
