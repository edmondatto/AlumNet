
const { Event, Sequelize: { Op } } = require('../models');

module.exports = {
  async create (request, response) {
    const { title, description } = request.body;
    const { uid: organiserId }  = request.user;

    if (!(title && description)) {
      return response.status(400).send({
        status: 400,
        msg: 'Must provide a title and description to create an event'
      })
    }

    try {
      const newEvent = await Event.create({...request.body, organiserId});

      return response.status(201).send({
        status: 201,
        msg: 'Event created successfully',
        post: newEvent
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
        status: 200,
        msg: 'Events retrieved successfully',
        events: group ? groupedEvents : events
      });
    } catch (error) {
      return response.status(500).send({
        status: 500,
        msg: 'internal server error',
        error
      });
    }
  },

  async fetchOne (request, response) {
    const { eventId } = request.params;
    const { user: currentUserId } = request.user;

    try {
      const event = await Event.findByPk(eventId);

      if (!event) {
        return response.status(404).send({
          status: 404,
          msg: `Event with ID ${eventId} does not exist`
        });
      }

      if (event.organiserId !== currentUserId && !event.isPublished) {
        return response.status(404).send({
          status: 404,
          msg: `Event with ID ${eventId} has not been published yet`
        });
      }

      return response.status(200).send({
        status: 200,
        msg: 'Event retrieved successfully',
        event
      });

    } catch (error) {
      return response.status(500).send({
        status: 500,
        msg: 'Internal server error'
      });
    }
  },

  async update (request, response) {
    // TODO: Extract as helper to check for empty body
    const updateRequestParams = Object.keys(request.body);
    if (updateRequestParams.length === 0) {
      return response.status(400).send({
        status: 400,
        msg: 'No updates received'
      });
    }

    if (updateRequestParams.includes('title') && !request.body.title) {
      return response.status(400).send({
        status: 400,
        msg: 'Event title cannot be set to an empty string'
      });
    }

    const { eventId } = request.params;
    const { uid: currentUserId = null }  = request.user;


    try {
      const eventToUpdate = await Event.findByPk(eventId);

      if (!eventToUpdate) {
        return response.status(404).send({
          status: 404,
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
        status: 200,
        msg: `Event with ID: ${eventId} has been updated successfully`,
        post: updatedEvent

      });
    } catch (error) {
      return response.status(500).send({
        status: 500,
        msg: 'Internal server error'
      });
    }
  },

  async delete (request, response) {
    const { eventId } = request.params;
    const { uid: currentUserId = null }  = request.user;

    try {
      const eventToDelete = await Event.findByPk(eventId);

      if (!eventToDelete) {
        return response.status(404).send({
          status: 404,
          msg: `Event with ID: ${eventId} does not exist`
        });
      }

      if (eventToDelete.organiserId !== currentUserId) {
        return response.status(403).send({
          status: 403,
          msg: 'Forbidden'
        });
      }

      await Event.destroy({
        where: {
          id: eventId
        }
      });

      return  response.status(200).send({
        status: 200,
        msg: `Event with ID: ${eventId} has been deleted successfully`
      });

    } catch (error) {
      return response.status(500).send({
        status: 500,
        msg: 'Internal server error',
      });
    }
  },
};