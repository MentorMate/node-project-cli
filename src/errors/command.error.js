class CommandError extends Error {
  constructor(message) {
    super(message);
    this.name = CommandError.name;
  }
}

module.exports = {
  CommandError,
};
