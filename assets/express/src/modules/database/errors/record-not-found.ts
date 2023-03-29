export class RecordNotFound extends Error {
  constructor(message = 'Record not found') {
    super(message);
    this.name = RecordNotFound.name;
  }
}
