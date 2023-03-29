export class DuplicateRecord extends Error {
  constructor(message = 'Record already exists') {
    super(message);
    this.name = DuplicateRecord.name;
  }
}
