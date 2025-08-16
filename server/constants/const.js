const DEFAULT_PAGINATION = {
  LIMIT: 10,
  OFFSET: 0,
};

const DEFAULT_SORT = {
  FIELD: 'NAME',
  DIRECTION: 'ASC',
  ASC: 'ASC',
  DESC: 'DESC',
  DIRECTION_MAP: {
    ASC: 1,
    DESC: -1,
  },
};

const DEFAULT_WHERE = {
  SEARCH: '',
  ROLE: '',
};

const USER_SORT_BY = {
  NAME: 'name',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
};

module.exports = {
  DEFAULT_PAGINATION,
  DEFAULT_SORT,
  DEFAULT_WHERE,
  USER_SORT_BY,
};
