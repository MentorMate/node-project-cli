module.exports = {
  meta: {
    id: 'dotenv',
    name: 'Environment Variables',
  },
  output: ({ envVars }) => ({
    devDependencies: {
      dotenv: '^16.0.3',
    },
    templates: [
      {
        template: 'dotenv/.env.example.ejs',
        target: '.env.example',
        props: { groups: envVars },
      },
    ],
  }),
};
