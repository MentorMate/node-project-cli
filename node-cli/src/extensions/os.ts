import { GluegunToolbox } from 'gluegun';

export default (toolbox: GluegunToolbox) => {
  toolbox.os = {
    isWin: () => process.platform === 'win32',
    isMac: () => process.platform === 'darwin',
  };
};
