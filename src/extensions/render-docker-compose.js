'use strict';

const YAML = require('yaml');

module.exports = (toolbox) => {
  toolbox.renderDockerCompose = ({ appDir, dockerComposeServices }) => {
    const {
      filesystem: { path, write },
    } = toolbox;

    const filename = path(appDir, 'docker-compose.yml');

    const content = {
      version: '3',
      services: dockerComposeServices,
    };

    write(filename, YAML.stringify(content));
  };
};
