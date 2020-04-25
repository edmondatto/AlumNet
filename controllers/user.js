const { User, Post, Skill } = require('../models');

module.exports = {
  async fetchAll (request, response) {
    try {
      const { rows: users, count: totalCount } = await User.findAndCountAll({
        attributes: ['id', 'firstName', 'lastName', 'username', 'avatarUrl'],
      });

      return response.status(200).send({
        status: 200,
        msg: 'Users retrieved successfully',
        totalCount,
        users
      });
    } catch (error) {
      return response.status(500).send({
        status: 500,
        msg: 'Internal server error',
        error
      });
    }
  },

  async fetchOne (request, response) {
    const { userIdentifier } = request.params;
    const findUserById = !userIdentifier.startsWith('@');

    const userQueryOptions = {
      include:[{
        model: Post,
        attributes: ['id', 'content', 'createdAt'],
      },{
        model: Skill,
        attributes: ['id', 'name'],
      }],
    };

    try {
      let user;

      if (findUserById) {
        user = await User.findByPk(userIdentifier, userQueryOptions);
      } else if (userIdentifier.substring(1).length === 0) {
        return response.status(400).send({
          status: 400,
          msg: 'No username provided'
        });
      } else {
        user = await User.findOne({
          ...userQueryOptions,
          where: {
            username: userIdentifier.substring(1)
          },
        });
      }

      if (user) {
        return response.status(200).send({
          status: 200,
          msg: 'User retrieved successfully',
          user: user
        });
      } else {
        return response.status(404).send({
          status: 404,
          msg: `User with ${findUserById ? 'ID' : 'username'} ${userIdentifier} does not exist`
        });
      }

    } catch (error) {
      return response.status(500).send({
        status: 500,
        msg: 'Internal server error',
      });
    }
  },

  async update (request, response) {
    const { userId } = request.params;
    const { uid: currentUserId = null }  = request.user;

    // Strip email from request.body; Email updates are only initiated on the firebase end
    const { email, skills, ...updateObject} = request.body;

    try {
      const userToUpdate = await User.findByPk(userId);

      if (!userToUpdate) {
        return response.status(404).send({
          status: 404,
          msg: `User with ID ${userId} does not exist`
        });
      }

      if (userToUpdate.id !== currentUserId) {
        return response.status(403).send({
          status: 403,
          msg: 'Forbidden'
        });
      }

      // Handle User Model Associations update
      if (skills && skills.length > 0) {
        await userToUpdate.addSkills(skills);
      }

      const updatedUser = await userToUpdate.update(updateObject);

      return response.status(200).send({
        status: 200,
        msg: `User with ID: ${currentUserId} has been updated successfully`,
        user: updatedUser
      });
    } catch (error) {
      return response.status(500).send({
        status: 500,
        msg: 'Internal server error',
      });
    }
  },
};