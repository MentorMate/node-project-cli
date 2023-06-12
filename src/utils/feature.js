const { CommandError } = require('../errors/command.error');

/**
 * Creates a multiselect prompt option from a feature definition
 */
const toMultiselectOption = (feature) => ({
  message: feature.meta.name,
  value: feature.meta.id,
});

const toExtension = (toolbox, feature) => {
  const extension = (input) => {
    const {
      filesystem: { copyAsync, dir, exists, path },
      print: { success, muted, error },
      system: { run, which },
      template: { generate },
    } = toolbox;

    const output = feature.output(input);

    return {
      syncOperations() {
        if (feature.dependencies?.os.path) {
          for (const executable of feature.dependencies.os.path) {
            if (!which(executable)) {
              throw new CommandError(`Command '${executable}' not found.`);
            }
          }
        }

        if (output.directories) {
          for (const { path, options } of output.directories) {
            if (exists(path)) {
              throw new CommandError(`Directory already exists: ${path}`);
            }

            dir(path, options);
          }
        }

        // if (output.envVars) {
        //   Object.assign(input.envVars, {
        //     [feature.meta.name]: output.envVars,
        //   });
        // }

        // Object.assign(input.pkgJson.scripts, output.scripts);

        // Object.assign(input.pkgJson.dependencies, output.dependencies);

        // Object.assign(input.pkgJson.devDependencies, output.devDependencies);

        // Object.assign(
        //   input.dockerComposeServices,
        //   output.dockerComposeServices
        // );
      },
      async asyncOperations() {
        muted(`Configuring ${feature.meta.name}`);

        try {
          await Promise.all([
            ...(output.commands ?? []).map(({ command, options }) =>
              run(command, options)
            ),

            ...(output.templates ?? []).map(({ target, ...rest }) =>
              generate({
                target: path(input.appDir, target),
                ...rest,
              })
            ),

            ...(output.assets ?? []).map((asset) =>
              copyAsync(
                path(input.assetsPath, asset.source),
                path(input.appDir, asset.target),
                asset.options
              )
            ),
          ]);
        } catch (err) {
          error(`${feature.meta.name} failed.`);
          throw err;
        }

        success(
          `${feature.meta.name} configured successfully. Please wait for the other steps to be completed...`
        );
      },
    };
  };

  return extension;
};

module.exports = {
  toMultiselectOption,
  toExtension,
};
