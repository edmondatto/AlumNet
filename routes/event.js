const { eventController } = require('../controllers');

const eventRouter = require('express').Router();

eventRouter.post('/', eventController.create);
eventRouter.get('/', eventController.fetchAll);
eventRouter.get('/:eventId', eventController.fetchOne);
eventRouter.put('/:eventId', eventController.update);
eventRouter.delete('/:eventId', eventController.delete);

module.exports = eventRouter;
