const { skillController } = require('../controllers');

const skillRouter = require('express').Router();

skillRouter.post('/', skillController.fetchOrCreate);
skillRouter.get('/:skillId', skillController.fetchOrCreate);
skillRouter.get('/', skillController.fetchAll);
skillRouter.delete('/', skillController.delete);


module.exports = skillRouter;