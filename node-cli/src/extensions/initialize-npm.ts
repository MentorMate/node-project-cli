import { GluegunToolbox } from 'gluegun';
import { UserInput } from '../@types';

export default (toolbox: GluegunToolbox) => {
  toolbox.initializeNpm = async ({ appDir }: UserInput) => {
    const { print, system } = toolbox;

    print.muted(`Initializing NPM...`);

    await system.run(`npm init -y`, { cwd: appDir });
  };
};
