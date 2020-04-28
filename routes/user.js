const { userController } = require('../controllers');

const userRouter = require('express').Router();

userRouter.get('/', userController.fetchAll);
userRouter.get('/:userIdentifier', userController.fetchByIdentifier);
userRouter.put('/:userId', userController.update);
userRouter.get('/:userId/streams', userController.fetchStreamsByUserId);
userRouter.get('/:userId/skills', userController.fetchSkillsByUserId);

module.exports = userRouter;