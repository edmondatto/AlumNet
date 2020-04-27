const { streamController } = require('../controllers');

const streamRouter = require('express').Router();

streamRouter.post('/', streamController.create);
streamRouter.get('/', streamController.fetchAll);
streamRouter.get('/:streamId', streamController.fetchOne);
streamRouter.post('/:streamId/join', streamController.join);
streamRouter.post('/:streamId/leave', streamController.leave);
streamRouter.post('/:streamId/addMembers', streamController.addMembers);
streamRouter.post('/:streamId/archive', streamController.archive);
streamRouter.post('/:streamId/restore', streamController.restore);

module.exports = streamRouter;
