const { classController } = require('../controllers');

const classRouter = require('express').Router();

classRouter.post('/create', classController.create);
classRouter.get('/', classController.fetchAll);
classRouter.get('/:classId', classController.fetchOne);
classRouter.post('/:classId/join', classController.join);

module.exports = classRouter;
