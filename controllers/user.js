const { User, Post, Skill, Stream } = require('../models');

module.exports = {
  async fetchAll (request, response, next) {
    try {
      const { rows: users, count: totalCount } = await User.findAndCountAll({
        attributes: ['id', 'firstName', 'lastName', 'username', 'avatarUrl'],
      });

      return response.status(200).send({
        msg: 'Users retrieved successfully',
        totalCount,
        users
      });
    } catch (error) {
      next(error);
    }
  },

  async fetchByIdentifier (request, response, next) {
    const { userIdentifier } = request.params;
    const findUserById = !userIdentifier.startsWith('@');

    const userQueryOptions = {
      include:[
        {
          model: Skill,
          attributes: ['id', 'name'],
        }
      ],
    };

    try {
      let user;

      if (findUserById) {
        user = await User.findByPk(userIdentifier, userQueryOptions);
      } else if (userIdentifier.substring(1).length === 0) {
        return response.status(400).send({
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
          msg: 'User retrieved successfully',
          user: user
        });
      } else {
        return response.status(404).send({
          msg: `User with ${findUserById ? 'ID' : 'username'} ${userIdentifier} does not exist`
        });
      }

    } catch (error) {
      next(error);
    }
  },

  async fetchStreamsByUserId (request, response, next) {
    const { uid: currentUserId } = request.user;
    const { userId } = request.params;

    if (userId !== currentUserId) {
      return response.status(403).send({
        msg: 'Forbidden'
      });
    }

    try {
      const user = await User.findByPk(userId);

      if (!user) {
        return response.status(404).send({
          msg: `User with ID:${userId} does not exist`
        });
      }

      const streams = await user.getStreams();

      return response.status(200).send({
        msg: 'Streams retrieved successfully',
        streams
      });
    } catch (error) {
      next(error);
    }
  },

  async fetchSkillsByUserId (request, response, next) {
    const { uid: currentUserId } = request.user;
    const { userId } = request.params;

    if (userId !== currentUserId) {
      return response.status(403).send({
        msg: 'Forbidden'
      });
    }

    try {
      const user = await User.findByPk(userId);

      if (!user) {
        return response.status(404).send({
          msg: `User with ID:${userId} does not exist`
        });
      }

      const skills = await user.getSkills();

      return response.status(200).send({
        msg: 'Skills retrieved successfully',
        skills
      });
    } catch (error) {
      next(error);
    }
  },

  async update (request, response, next) {
    const { userId } = request.params;
    const { uid: currentUserId = null }  = request.user;

    // Strip email from request.body; Email updates are only initiated on the firebase end
    const { email, skills, ...updateObject} = request.body;

    let newSkills = [];
    // FIXME: Smelly code
    if (skills) {
      if (typeof skills === 'string') {
        newSkills = [
          ...newSkills,
          ...skills.split(',').map(id => id.trim()).filter(id => id)
        ];
      } else if (Array.isArray(skills)) {
        newSkills = [...newSkills, ...skills.filter(id => id)];
      } else {
        return response.status(400).send({
          msg: 'Provide an array or comma-separated string of IDs of skills to add',
        });
      }
    }

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

      // Handle username checks
      let usernameExists;
      if (request.body.username.length > 0) {
        usernameExists = await User.findOne({ where: { username: request.body.username }});
      }

      if (usernameExists) {
        return response.status(422).send({
            msg: 'Username already exists'
        });
      }

      // Handle User Model Associations update
      if (newSkills.length > 0) {
        await userToUpdate.addSkills(newSkills);
      }

      const updatedUser = await userToUpdate.update(updateObject);

      return response.status(200).send({
        msg: `User with ID: ${currentUserId} has been updated successfully`,
        user: updatedUser
      });
    } catch (error) {
      next(error);
    }
  },
};