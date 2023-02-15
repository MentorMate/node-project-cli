'use strict';

module.exports = (toolbox) => {
  toolbox.initializeGit = async ({ appDir }) => {
    const { print, system } = toolbox;

    print.muted(`Initializing git...`);

    await system.run(`git init && git checkout -b main`, { cwd: appDir });
  };
};
