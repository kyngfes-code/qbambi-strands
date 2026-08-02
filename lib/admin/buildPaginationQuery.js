export default function buildPaginationQuery(
  query,
  page = 1,
  pageSize = 20,
  maxPageSize = 100,
) {
  const currentPage = Math.max(Number(page) || 1, 1);

  const limit = Math.min(Math.max(Number(pageSize) || 20, 1), maxPageSize);

  const from = (currentPage - 1) * limit;
  const to = from + limit - 1;

  return query.range(from, to);
}

export function buildPaginationMeta({ page, pageSize, total = 0 }) {
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  return {
    page,
    pageSize,
    total,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
    previousPage: page > 1 ? page - 1 : null,
    nextPage: page < totalPages ? page + 1 : null,
  };
}
