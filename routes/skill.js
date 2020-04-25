const { skillController } = require('../controllers');

const skillRouter = require('express').Router();

skillRouter.post('/', skillController.fetchOrCreate);
skillRouter.get('/:skillId', skillController.fetchOrCreate);
skillRouter.get('/', skillController.fetchAll);


module.exports = skillRouter;