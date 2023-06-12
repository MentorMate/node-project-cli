module.exports = {
  meta: {
    id: 'pg',
    name: 'PostgreSQL',
  },
  output: () => ({
    dependencies: {
      pg: '^8.9.0',
    },
    devDependencies: {
      '@types/pg': '^8.6.6',
    },
    envVars: {
      PGHOST: 'localhost',
      PGPORT: 5432,
      PGUSER: 'user',
      PGPASSWORD: 'password',
      PGDATABASE: 'default',
    },
    // TODO: figuire out how to do docker-compose.overrides.example.yml
    dockerComposeServices: {
      db: {
        image: 'postgres:13-alpine',
        restart: 'always',
        ports: ['${PGPORT}:5432'],
        environment: {
          POSTGRES_USER: '${PGUSER}',
          POSTGRES_DB: '${PGDATABASE}',
          POSTGRES_PASSWORD: '${PGPASSWORD}',
        },
      },
    },
  }),
};
