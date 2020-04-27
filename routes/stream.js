const { streamController } = require('../controllers');

const streamRouter = require('express').Router();

streamRouter.post('/', streamController.create);
streamRouter.get('/', streamController.fetchAll);
streamRouter.post('/:streamId/join', streamController.join);

module.exports = streamRouter;
