'use strict';

module.exports = (toolbox) => {
  toolbox.os = {
    isWin: () => process.platform === 'win32',
  };
};
