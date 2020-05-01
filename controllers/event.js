
const { Event, Sequelize: { Op } } = require('../models');
const { helpers: { isRequestBodyEmpty } } = require('../utils');

module.exports = {
  async create (request, response, next) {
    const { title, description } = request.body;
    const { uid: organiserId }  = request.user;

    if (!(title && description)) {
      return response.status(400).send({
        msg: 'Must provide a title and description to create an event'
      })
    }

    try {
      const newEvent = await Event.create({...request.body, organiserId});

      return response.status(201).send({
        msg: 'Event created successfully',
        post: newEvent
      });
    } catch (error) {
      next(error);
    }
  },

  async fetchAll (request, response, next) {
    const { uid: currentUserId } = request.user;
    const { group = true } = request.query;

    try {
      const events = await Event.findAll({
        where: {
          [Op.or]: [
            {
              isPublished: true
            },
            {
              isPublished: false,
              organiserId: currentUserId
            }
          ]
        },
        attributes: ['id', 'title', 'description', 'date', 'isPublished', 'coverImage', 'organiserId']
      });

      const groupedEvents = {};
      
      if (group) {
        groupedEvents.userEvents = events.filter(event => event.organiserId === currentUserId);
        groupedEvents.publicEvents = events.filter(event => event.organiserId !== currentUserId);
      }

      return response.status(200).send({
        msg: 'Events retrieved successfully',
        events: group ? groupedEvents : events
      });
    } catch (error) {
      next(error);
    }
  },

  async fetchOne (request, response, next) {
    const { eventId } = request.params;
    const { user: currentUserId } = request.user;

    try {
      const event = await Event.findByPk(eventId);

      if (!event) {
        return response.status(404).send({
          msg: `Event with ID ${eventId} does not exist`
        });
      }

      if (event.organiserId !== currentUserId && !event.isPublished) {
        return response.status(404).send({
          msg: `Event with ID ${eventId} has not been published yet`
        });
      }

      return response.status(200).send({
        msg: 'Event retrieved successfully',
        event
      });

    } catch (error) {
      next(error);
    }
  },

  async update (request, response, next) {
    const emptyRequestBodyResponse = isRequestBodyEmpty(request.body);

    if (emptyRequestBodyResponse) {
      const { status: statusCode, msg } = emptyRequestBodyResponse;
      return response.status(statusCode).send({ msg });
    }

    const updateRequestParams = Object.keys(request.body);

    if (updateRequestParams.includes('title') && !request.body.title) {
      return response.status(400).send({
        msg: 'Event title cannot be set to an empty string'
      });
    }

    const { eventId } = request.params;
    const { uid: currentUserId = null }  = request.user;

    try {
      const eventToUpdate = await Event.findByPk(eventId);

      if (!eventToUpdate) {
        return response.status(404).send({
          msg: `Event with ID: ${eventId} does not exist`
        });
      }

      if (eventToUpdate.organiserId !== currentUserId) {
        return response.status(403).send({
          status: 403,
          msg: 'Forbidden'
        });
      }

      const updatedEvent = await eventToUpdate.update({...request.body, isEdited: true});

      return response.status(200).send({
        msg: `Event with ID: ${eventId} has been updated successfully`,
        post: updatedEvent

      });
    } catch (error) {
      next(error);
    }
  },

  async delete (request, response, next) {
    const { eventId } = request.params;
    const { uid: currentUserId = null }  = request.user;

    try {
      const eventToDelete = await Event.findByPk(eventId);

      if (!eventToDelete) {
        return response.status(404).send({
          msg: `Event with ID: ${eventId} does not exist`
        });
      }

      if (eventToDelete.organiserId !== currentUserId) {
        return response.status(403).send({
          msg: 'Forbidden'
        });
      }

      await Event.destroy({
        where: {
          id: eventId
        }
      });

      return  response.status(204).send();

    } catch (error) {
      next(error);
    }
  },
};