module.exports = function errorHandler (error, request, response, next) {
  response.status(error.status || 500).send({
    error: {
      message: error.message || 'Internal server error'
    }
  })
};