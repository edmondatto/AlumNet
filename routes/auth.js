const { authController } = require('../controllers');

const authRouter = require('express').Router();

authRouter.post('/register', authController.registerUser);
authRouter.get('/login', authController.login);

module.exports = authRouter;
