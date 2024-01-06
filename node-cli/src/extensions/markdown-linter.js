'use strict';

module.exports = (toolbox) => {
  toolbox.setupMarkdownLinter = ({ pkgJson }) => {
    function syncOperations() {
      Object.assign(pkgJson.scripts, {
        'lint:markdown': 'markdownlint **/*.md --ignore node_modules',
      });

      Object.assign(pkgJson.devDependencies, {
        'markdownlint-cli': '~0.34.0',
      });
    }

    return {
      syncOperations,
    };
  };
};
