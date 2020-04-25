const { Profession } = require('../models');

module.exports = {
  async fetchOrCreate (request, response) {
    const { name } = request.body;
    const { professionId } = request.params;

    if (professionId) {
      const profession = await Profession.findByPk(professionId);

      if (profession) {
        return response.status(200).send({
          status: 200,
          msg: 'Profession retrieved successfully',
          profession,
        });
      } else {
        return response.status(404).send({
          status: 404,
          msg: `Profession with ID:${professionId} does not exist`
        });
      }
    }

    if (!name) {
      return response.status(400).send({
        status: 400,
        msg: 'Request must include profession\'s name.'
      });
    }

    try {
      const [profession, created] = await Profession.findOrCreate({
        where: { name }
      });

      if (created) {
        return response.status(201).send({
          status: 201,
          msg: 'Profession created successfully',
          profession
        });
      }

      return response.status(200).send({
        status: 200,
        msg: 'Profession retrieved successfully',
        profession
      });
    } catch (error) {
      return response.status(500).send({
        status: 500,
        msg: 'Internal server error'
      });
    }
  },

  async fetchAll (request, response) {
    try {
      const { rows: professions, count: totalCount } = await Profession.findAndCountAll();

      return response.status(200).send({
        status: 200,
        msg: 'Professions retrieved successfully',
        professions,
        totalCount,
      })
    } catch (error) {
      return response.status(500).send({
        status: 500,
        msg: 'Internal server error'
      });
    }
  },
};