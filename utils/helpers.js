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

module.exports = {
  isValidUUID,
  isRequestBodyEmpty
};