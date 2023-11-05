export type PaginationQuery = {
  pageNo: string;
  limit: string;
}

export const getParsedPagination = (query: PaginationQuery) => {
  const { pageNo = "0", limit = "20" } = query;

  const parsedPageNo = isNaN(parseInt(pageNo)) ? 0 : parseInt(pageNo);
  const parsedLimit = isNaN(parseInt(limit)) ? 20 : parseInt(limit);
  const skipValue = parsedPageNo * parsedLimit;

  return { parsedPageNo, parsedLimit, skipValue };
};

