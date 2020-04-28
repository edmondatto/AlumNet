const { streamController, postController } = require('../controllers');

const streamRouter = require('express').Router();

streamRouter.post('/', streamController.create);
streamRouter.get('/', streamController.fetchAll);
streamRouter.get('/:streamId', streamController.fetchOne);
streamRouter.get('/:streamId/posts', postController.fetchPosts);
streamRouter.post('/:streamId/posts', postController.create);
streamRouter.get('/:streamId/posts/:postId', postController.fetchOne);
streamRouter.put('/:streamId/posts/:postId', postController.update);
streamRouter.delete('/:streamId/posts/:postId', postController.delete);
streamRouter.post('/:streamId/join', streamController.join);
streamRouter.post('/:streamId/leave', streamController.leave);
streamRouter.post('/:streamId/add-members', streamController.addMembers);
streamRouter.post('/:streamId/archive', streamController.archive);
streamRouter.post('/:streamId/restore', streamController.restore);

module.exports = streamRouter;
