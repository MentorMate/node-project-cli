export class RecordNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = RecordNotFoundError.name;
  }
}
