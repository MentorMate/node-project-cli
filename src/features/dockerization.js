module.exports = {
  meta: {
    id: 'dockerization',
    name: 'Containerization with Docker',
  },
  output: ({ projectName, projectLanguage, build }) => ({
    scripts: {
      'image:build': `DOCKER_BUILDKIT=1 docker build -t ${projectName} .`,
      'image:run': `docker run --rm --net host -e NODE_ENV=production --env-file .env ${projectName}`,
      'lint:dockerfile': `docker run --rm -i hadolint/hadolint < Dockerfile`,
    },
    templates: [
      {
        template: `docker/${projectLanguage.toLowerCase()}/Dockerfile.ejs`,
        target: 'Dockerfile',
        props: {
          imageTag: '18-alpine',
          buildDir: build.dir,
          entryPoint: build.entryPoint,
          ...(build.rebuildDependencies && {
            rebuildDependencies: build.rebuildDependencies,
          }),
        },
      },
      {
        template: `docker/.dockerignore.ejs`,
        target: '.dockerignore',
        props: {
          paths: [
            'node_modules',
            '.git',
            '.github',
            '.husky',
            '.vscode',
            'dist',
            'coverage*',
            'Dockerfile',
            'docker-compose*',
            '.nvmrc',
            '.env*',
            '.eslint*',
            '.prettier*',
            'README.md',
          ],
        },
      },
    ],
  }),
};
