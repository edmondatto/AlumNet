const { User, Post, Skill, Stream } = require('../models');

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

  async fetchByIdentifier (request, response) {
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
        error
      });
    }
  },

  async fetchStreamsByUserId (request, response) {
    const { uid: currentUserId } = request.user;
    const { userId } = request.params;

    if (userId !== currentUserId) {
      return response.status(403).send({
        status: 403,
        msg: 'Forbidden'
      });
    }

    try {
      const user = await User.findByPk(userId);

      if (!user) {
        return response.status(404).send({
          status: 404,
          msg: `User with ID:${userId} does not exist`
        });
      }

      const streams = await user.getStreams();

      return response.status(200).send({
        status: 200,
        msg: 'Streams retrieved successfully',
        streams
      });
    } catch (error) {
      return response.status(500).send({
        status: 500,
        msg: 'Internal server error',
        error
      });
    }
  },

  async fetchSkillsByUserId (request, response) {
    const { uid: currentUserId } = request.user;
    const { userId } = request.params;

    if (userId !== currentUserId) {
      return response.status(403).send({
        status: 403,
        msg: 'Forbidden'
      });
    }

    try {
      const user = await User.findByPk(userId);

      if (!user) {
        return response.status(404).send({
          status: 404,
          msg: `User with ID:${userId} does not exist`
        });
      }

      const skills = await user.getSkills();

      return response.status(200).send({
        status: 200,
        msg: 'Skills retrieved successfully',
        skills
      });
    } catch (error) {
      return response.status(500).send({
        status: 500,
        msg: 'Internal server error',
        error
      });
    }
  },

  async update (request, response) {
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
          status: 400,
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
        return response.status(400).send({
            status: 400,
            msg: 'Username already exists'
        });
      }

      // Handle User Model Associations update
      if (newSkills.length > 0) {
        await userToUpdate.addSkills(newSkills);
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
        error
      });
    }
  },
};