const { userController } = require('../controllers');

const userRouter = require('express').Router();

userRouter.get('/', userController.fetchAll);
userRouter.get('/:userIdentifier', userController.fetchOne);
userRouter.put('/:userId', userController.updateUser);

module.exports = userRouter;
