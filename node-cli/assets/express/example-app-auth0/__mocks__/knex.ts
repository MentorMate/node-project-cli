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
  // eslint-disable-next-line security/detect-object-injection
  return (mocks[name] ||= newQueryBuilder());
});

interface KnexType {
  (): typeof knex;
  QueryBuilder: {
    extend(): void;
  };
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const Knex: KnexType = jest.fn(() => knex);

Knex.QueryBuilder = {
  extend() {
    return;
  },
};

export default Knex;
