'use strict';

module.exports = (toolbox) => {
  toolbox.initializeNpm = async ({ appDir }) => {
    const { print, system } = toolbox;

    print.muted(`Initializing NPM...`);

    await system.run(`npm init -y`, { cwd: appDir });
  };
};
