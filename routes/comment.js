const { commentController } = require('../controllers');

const commentRouter = require('express').Router();

commentRouter.post('/:postId/comments', commentController.create);
commentRouter.get('/:postId/comments', commentController.fetchAll);
commentRouter.get('/:postId/comments/:commentId', commentController.fetchById);
commentRouter.put('/:postId/comments/:commentId', commentController.update);
commentRouter.delete('/:postId/comments/:commentId', commentController.delete);

module.exports = commentRouter;
