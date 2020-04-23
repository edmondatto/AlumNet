const { postController } = require('../controllers');

const postRouter = require('express').Router();

postRouter.post('/', postController.create);

module.exports = postRouter;
