import { GluegunToolbox } from 'gluegun';
import { CommandError } from '../errors/command.error';
import { UserInput } from '../@types';

export default (toolbox: GluegunToolbox) => {
  toolbox.createProjectDirectory = async ({ appDir }: UserInput) => {
    const { filesystem, print } = toolbox;

    print.muted(`Creating directory...`);

    if (filesystem.exists(appDir)) {
      throw new CommandError(`Directory already exists: ${appDir}`);
    }

    filesystem.dir(appDir);
  };
};
