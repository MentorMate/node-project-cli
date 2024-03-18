import nodeCli from './node-cli';

const toolbox = {
  print: {
    info: jest.fn(() => {}),
  },
};

describe('node-cli', () => {
  it('should be defined', () => {
    expect(nodeCli).toBeDefined();
    expect(nodeCli.name).toBeDefined();
    expect(nodeCli.run).toBeDefined();
  });

  describe('run', () => {
    beforeAll(async () => {
      await nodeCli.run(toolbox as any);
    });

    it('should print info on using the cli', () => {
      expect(toolbox.print.info).toHaveBeenCalledTimes(1);
    });
  });
});
