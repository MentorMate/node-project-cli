import { GluegunToolbox } from 'gluegun';

export default {
  name: 'node-cli',
  run: async ({ print }: GluegunToolbox) => {
    print.info(
      'Generate a Node.js project using `node-cli g [project name]` or `node-cli generate [project name]'
    );
  },
};

