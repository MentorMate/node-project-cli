const newQueryBuilder = () => ({
  where() {
    return this;
  },
  first() {
    return this;
  },
  update() {
    return this;
  },
  del() {
    return this;
  },
  insert() {
    return this;
  },
  returning() {
    return this;
  },
  count() {
    return this;
  },
  clone() {
    return this;
  },
  filter() {
    return this;
  },
  sort() {
    return this;
  },
  paginate() {
    return this;
  },
  list() {
    return this;
  },
  then() {
    return this;
  },
  catch() {
    return this;
  },
});

const mocks: Record<string, ReturnType<typeof newQueryBuilder>> = {};

const knex = jest.fn((name: string) => {
  return (mocks[name] ||= newQueryBuilder());
});

const Knex = jest.fn(() => knex);

export default Knex;
