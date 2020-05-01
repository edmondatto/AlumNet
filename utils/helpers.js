const CONSTANTS  = require('./constants');

/**
 * Checks whether an id is of the type UUID (versions 1 - 5), excluding NIL UUID*
 * @param {string} id - The id to be tested
 * @return {boolean} - Whether or not the id is a valid UUID
 */
function isValidUUID(id) {
  // TODO: Extend to return response  as well
  const uuidRegex = new RegExp('^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$', 'i');
  return uuidRegex.test(id);
}

/**
 * Checks whether an request's body is empty
 * @param {object} requestBody - The request body to be checked
 * @return {boolean | object} - Returns false is the check passes, and a response body object literal if it fails
 */
function isRequestBodyEmpty (requestBody) {
  const answer = Object.keys(requestBody).length === 0;
  const responseBody = {};

  if (!answer) { return false }

  responseBody.status = 400;
  responseBody.msg = 'Empty body received';

  return responseBody
}

/**
 * Creates a sort matrix for queries
 * @param {string} sortParams - Sort params from request.query
 * @return {[]} - Returns the sort matrix
 */
function buildQuerySortMatrix (sortParams) {
  if (!sortParams) return [];

  const firstPassMatrix = [...sortParams.split(',')];
  return firstPassMatrix.map(item => item.split(':'));
}

/**
 * Creates a matrix for attributes to be included in a query response
 * @param {string} includeParams - Sort params from request.query
 * @return {[]} - Returns the include matrix
 */
function buildIncludeMatrix (includeParams) {
  if (!includeParams) return [];
  if (Array.isArray(includeParams)) return includeParams;

  return includeParams.split(',');
}

/**
 * Generates an object literal with Pagination Links
 * @param {string} url - The Url of the current request
 * @param {number} pageNumber - Current page number as per request
 * @param {number} totalPages - Total number of pages of results returned
 * @return {object} - Returns the set of pagination links
 */
function generatePaginationLinks (url, pageNumber, totalPages) {
  return {
    ...pageNumber > 1 && {
      first: url.replace(`page=${pageNumber}`, `page=1`),
      ...pageNumber - 1 > 1 && { previous: url.replace(`page=${pageNumber}`, `page=${pageNumber > 1 ? pageNumber - 1 : pageNumber}`) },
    },
    ...{ current: url },
    ...pageNumber < totalPages && {
      ...totalPages - pageNumber > 1 && { next: url.replace(`page=${pageNumber}`, `page=${pageNumber + 1}`) },
      last: url.replace(`page=${pageNumber}`, `page=${totalPages}`)
    },
  };
}

/**
 * Generates an JSON representation of the pagination links
 * @param {object} paginationLinks - Object with pagination links
 * @param {number} totalCount - Current page number as per request
 * @param {number} totalPages - Total number of pages of results returned
 * @return {object} - Returns the JSON pagination links
 */
function generatePaginationResponse (paginationLinks, totalCount, totalPages) {
  const { first, previous, current, next, last } = paginationLinks;

  return {
    ...first && {first: { url: first } },
    ...previous && {previous: { url: previous } },
    ...{ current: { url: current } },
    ...next && {next: { url: next } },
    ...last && {last: { url: last } },
    totalCount,
    totalPages,
  };
}

/**
 * Parses a string representation of a page limit into an integer
 * @param {string} limit - String representation of the page limit
 * @return {number} - Returns the parsed limit
 */
function getParsedLimit (limit) {
  return parseInt(limit) < 1
    ? CONSTANTS.DEFAULT_PAGE_LIMIT
    : parseInt(limit) > 100
      ? CONSTANTS.MAX_PAGE_LIMIT
      : parseInt(limit);
}

/**
 * Processes a partial request query
 * @param {object} partialRequestQueryBody - attributes from the request query
 * @return {object} - Returns an object with the processed entities
 */
function processQueryString (partialRequestQueryBody) {
  const { limit, page, sort, include } = partialRequestQueryBody;
  const parsedLimit = limit && getParsedLimit(limit);
  const parsedPageNumber = page && parseInt(page);
  const offset = (parsedPageNumber && parsedLimit) && parsedPageNumber > 0 ? (parsedPageNumber - 1) * parsedLimit : 0;
  const sortMatrix = buildQuerySortMatrix(sort);
  const includeAttributesMatrix = buildIncludeMatrix(include);

  return {
    parsedLimit,
    parsedPageNumber,
    offset,
    sortMatrix,
    includeAttributesMatrix,
  };
}

/**
 * Generates pagination info for the current request's result(s)
 * @param {string} requestUrl - Url of current request
 * @param {number} resultsCount - Total number of results from request
 * @param {number} limit - Results requested per page
 * @param {number} pageNumber - Requested page number
 * @return {object} - Returns an object with the pagination info
 */
function generatePaginationInfo (requestUrl, resultsCount, limit, pageNumber) {
  const totalPages = Math.ceil(resultsCount/limit);
  const paginationLinks = generatePaginationLinks(requestUrl, pageNumber, totalPages);
  const paginationResponse = generatePaginationResponse(paginationLinks, resultsCount, totalPages);

  return { paginationLinks, paginationResponse };
}

module.exports = {
  isValidUUID,
  isRequestBodyEmpty,
  processQueryString,
  generatePaginationInfo,
};