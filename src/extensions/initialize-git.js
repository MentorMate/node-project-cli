'use strict';

module.exports = (toolbox) => {
  toolbox.initializeGit = async ({ appDir, assetsPath }) => {
    const { filesystem, print, system } = toolbox;

    print.muted(`Initializing git...`);

    if (!system.which('git')) {
      throw new Error(`Command 'git' not found.`);
    }

    await system.run(`git init && git checkout -b main`, { cwd: appDir });

    await filesystem.copyAsync(
      `${assetsPath}/git/.gitignore`,
      `${appDir}/.gitignore`
    );
  };
};
