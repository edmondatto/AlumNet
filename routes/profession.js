const { professionController } = require('../controllers');

const professionRouter = require('express').Router();

professionRouter.post('/', professionController.fetchOrCreate);
professionRouter.get('/', professionController.fetchAll);
professionRouter.get('/:professionId', professionController.fetchOrCreate);

module.exports = professionRouter;