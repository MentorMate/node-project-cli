import { GluegunToolbox } from 'gluegun';
import { CommandError } from '../errors/command.error';
import { UserInput } from '../@types';

export default (toolbox: GluegunToolbox) => {
  toolbox.initializeGit = async ({ appDir, assetsPath }: UserInput) => {
    const { filesystem, print, system } = toolbox;

    print.muted(`Initializing git...`);

    if (!system.which('git')) {
      throw new CommandError(`Command 'git' not found.`);
    }

    await system.run(`git init && git checkout -b main`, { cwd: appDir });

    await filesystem.copyAsync(
      `${assetsPath}/git/gitignorefile`,
      `${appDir}/.gitignore`,
    );
  };
};
