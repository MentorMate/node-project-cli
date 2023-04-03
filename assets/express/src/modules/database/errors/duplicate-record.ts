export class DuplicateRecord extends Error {
  constructor(message: string) {
    super(message);
    this.name = DuplicateRecord.name;
  }
}
