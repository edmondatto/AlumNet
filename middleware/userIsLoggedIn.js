const { admin } = require('../controllers').authController;

module.exports = async (request, response, next) => {
  if ((!request.headers.authorization || !request.headers.authorization.startsWith('Bearer ')) &&
    !(request.cookies && request.cookies.__session)) {

    return response.status(403).send({
      status: 403,
      msg: 'Unauthorized user'
    });
  }

  let idToken;

  if (request.headers.authorization && request.headers.authorization.startsWith('Bearer ')) {
    idToken = request.headers.authorization.split('Bearer ')[1];
  } else if(request.cookies) {
    idToken = request.cookies.__session;
  } else {
    return response.status(403).send({
      status: 403,
      msg: 'Unauthorized user'
    });
  }

  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);
    request.user = decodedIdToken;
    next();
  } catch (error) {
    return response.status(403).send({
      status: 403,
      msg: 'Unauthorized user'
    });
  }
};
