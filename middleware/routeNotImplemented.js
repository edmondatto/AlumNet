module.exports = function(request, response, next) {
  const error = new Error('Not Found');
  next(error);
};