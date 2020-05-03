const { Profession } = require('../models');
const { helpers: { isValidUUID } } = require('../utils');

module.exports = {
  async fetchOrCreate (request, response, next) {
    const { name } = request.body;
    const { professionId } = request.params;
    try {
      if (professionId) {
        if (!isValidUUID(professionId)) {
          return response.status(400).send({
            msg: 'Invalid profession ID. Must be a UUID'
          });
        }

        const profession = await Profession.findByPk(professionId);

        if (!profession) {
          return response.status(404).send({
            msg: `Profession with ID:${professionId} does not exist`
          });
        }

        return response.status(200).send({
          msg: 'Profession retrieved successfully',
          profession,
        });
      }

      if (!name) {
        return response.status(400).send({
          msg: 'Request must include profession\'s name.'
        });
      }

      const [profession, created] = await Profession.findOrCreate({ where: { name } });

      if (created) {
        response.set('Location', `${request.originalUrl}/${profession.id}`);

        return response.status(201).send({
          msg: 'Profession created successfully',
          profession
        });
      }

      return response.status(200).send({
        msg: 'Profession retrieved successfully',
        profession
      });
    } catch (error) {
      next(error);
    }
  },

  async fetchAll (request, response, next) {
    try {
      const { rows: professions, count: totalCount } = await Profession.findAndCountAll();

      return response.status(200).send({
        msg: 'Professions retrieved successfully',
        professions,
        totalCount,
      })
    } catch (error) {
      next(error);
    }
  },
};