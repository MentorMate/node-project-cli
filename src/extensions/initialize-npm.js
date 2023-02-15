'use strict';

module.exports = (toolbox) => {
  toolbox.initializeNpm = async ({ appDir, projectScope }) => {
    const { print, system } = toolbox;

    print.muted(`Initializing NPM...`);

    await system.run(`npm init -y --scope ${projectScope}`, { cwd: appDir });
  };
};
