const { Skill, User } = require('../models');
const { helpers: { isValidUUID } } = require('../utils');

module.exports = {
  async fetchOrCreate (request, response, ) {
    const { name } = request.body;
    const { skillId } = request.params;

    try {
      if (skillId) {
        if (!isValidUUID(skillId)) {
          return response.status(400).send({
            msg: 'Invalid skill ID. Must be a UUID'
          });
        }

        const skill = await Skill.findByPk(skillId);

        if (!skill) {
          return response.status(404).send({
            msg: `Skill with ID:${skillId} does not exist`
          });
        }

        return response.status(200).send({
          msg: 'Skill retrieved successfully',
          skill,
        });
      }

      if (!name) {
        return response.status(400).send({
          msg: 'Request must include skill\'s name.'
        });
      }

      const [skill, created] = await Skill.findOrCreate({where: { name } });

      if (created) {
        return response.status(201).send({
          msg: 'Skill created successfully',
          skill
        });
      }

      return response.status(200).send({
        msg: 'Skill retrieved successfully',
        skill
      });
    } catch (error) {
      next(error);
    }
  },

  async fetchAll (request, response, next) {
    try {
      const { rows: skills, count: totalCount } = await Skill.findAndCountAll();

      return response.status(200).send({
        msg: 'Skills retrieved successfully',
        skills,
        totalCount,
      })
    } catch (error) {
      next(error);
    }
  },

  // TODO: Should this be on the user model??
  async delete (request, response, next) {
    // TODO: Change this to request.params for Prod
    const { skillIds } = request.body;
    const { uid: currentUserId } = request.user;

    // TODO: Extract into utility method
    let skillIdsToDelete;
    if (typeof skillIds === 'string') {
      skillIdsToDelete = [skillIds];
    } else if (Array.isArray(skillIds) && skillIds.length !== 0) {
      skillIdsToDelete = skillIds;
    } else {
      return response.status(400).send({
        msg: 'Provide either an array of ID(s) or a single ID string'
      });
    }

    try {
      const user = await User.findByPk(currentUserId);
      await user.removeSkills(skillIdsToDelete);

      response.status(204).send();
    } catch (error) {
      next(error);
    }

  },
};