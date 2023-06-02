'use strict';

module.exports = (toolbox) => {
  toolbox.shouldPrintHelp = () => {
    const { parameters } = toolbox;
    const { first, options } = parameters;

    return first === 'help' || options['help'] || options['h'];
  };
};
