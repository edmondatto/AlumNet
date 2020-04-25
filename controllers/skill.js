const { Skill } = require('../models');

module.exports = {
  async fetchOrCreate (request, response) {
    const { name } = request.body;
    const { skillId } = request.params;

    if (skillId) {
      const skill = await Skill.findByPk(skillId);

      if (skill) {
        return response.status(200).send({
          status: 200,
          msg: 'Skill retrieved successfully',
          skill,
        });
      } else {
        return response.status(404).send({
          status: 404,
          msg: `Skill with ID:${skillId} does not exist`
        });
      }
    }

    if (!name) {
      return response.status(400).send({
        status: 400,
        msg: 'Request must include skill\'s name.'
      });
    }

    try {
      const [skill, created] = await Skill.findOrCreate({
        where: { name }
      });

      if (created) {
        return response.status(201).send({
          status: 201,
          msg: 'Skill created successfully',
          skill
        });
      }

      return response.status(200).send({
        status: 200,
        msg: 'Skill retrieved successfully',
        skill
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
      const { rows: skills, count: totalCount } = await Skill.findAndCountAll();

      return response.status(200).send({
        status: 200,
        msg: 'Skills retrieved successfully',
        skills,
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