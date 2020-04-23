const { Class, User } = require('../models');

module.exports = {
  async create (request, response) {
    const { year } = request.body;

    if (!year) {
      return response.status(400).send({
        status: 400,
        msg: 'Provide a year to create a new class'
      });
    }

    if (year.toString().length !== 4 || !parseInt(year) || !(parseInt(year) > 1900)) {
      return response.status(400).send({
        status: 400,
        msg: 'Provide a valid year after 1900'
      });
    }

    try {
      const classAlreadyExists = await Class.findOne({
        where: {
          year: year
        }
      });

      if (classAlreadyExists) {
        return response.status(400).send({
          status: 400,
          msg: `Class of ${year} already exists`
        });
      }

      const newClass = await Class.create({ year });

      return response.status(201).send({
        status: 201,
        msg: `Class of ${year} created successfully`,
        class: newClass
      });
    } catch (error) {
      return response.status(500).send({
        status: 500,
        msg: 'Internal server error',
        error
      });
    }
  },

  async join (request, response) {
    const { classId } = request.params;
    const { uid: userId = null }  = request.user;

    // TODO: Implement logic to limit users hopping fromm class to class

    try {
      const userEntity = await User.findByPk(userId);

      if (userEntity.classId === classId) {
        return response.status(400).send({
          status: 400,
          msg: 'User is already a member of this class'
        })
      }

      userEntity.update({
        classId,
        classUpdatedOn: Date.now()
      });

      return response.status(200).send({
        status: 200,
        msg: `User has joined class with ID: ${classId} successfully`
      });
    } catch (error) {
      return response.status(500).send({
        status: 500,
        msg: 'Internal server error',
        error
      });
    }
  },

  async fetchAll (request, response) {
    try {
      // TODO: Implement filters via query params
      const { rows: classes, count: totalCount } = await Class.findAndCountAll({
        include:[{
          model: User,
          as: 'members',
          attributes: ['id', 'firstName', 'lastName', 'avatarUrl', 'username'],
        }]
      });

      return response.status(200).send({
        status: 201,
        msg: 'Classes retrieved successfully',
        totalCount,
        classes
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
    const { classId } = request.params;

    try {
      const classEntity = await Class.findByPk(classId);

      if (classEntity) {
        return response.status(200).send({
          status: 201,
          msg: 'Class retrieved successfully',
          class: classEntity
        });
      } else {
        return response.status(404).send({
          status: 404,
          msg: `Class with ID ${classId} does not exist`
        });
      }

    } catch (error) {
      return response.status(500).send({
        status: 500,
        msg: 'Internal server error'
      });
    }
  },
};