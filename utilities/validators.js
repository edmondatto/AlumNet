/**
 * Checks whether an id is of the type UUID (versions 1 - 5), excluding NIL UUID*
 * @param {string} id - The id to be tested
 * @return {boolean} - Whether or not the id is a valid UUID
 */
function uuid(id) {
  // TODO: Extend to return response  as well
  const uuidRegex = new RegExp('^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$', 'i');
  return uuidRegex.test(id);
}

module.exports = {
  uuid,
};