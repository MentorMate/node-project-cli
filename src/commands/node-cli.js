const command = {
  name: 'node-cli',
  run: async (toolbox) => {
    const { print } = toolbox

    print.info(
      'Generate a Node.js project using `node-cli g [project name]` or `node-cli generate [project name]'
    )
  },
}

module.exports = command
