const { Stream, User, Sequelize: { Op } } = require('../models');
const {
  CONSTANTS,
  helpers: {
    processQueryString,
    generatePaginationLinks,
    generatePaginationResponse,
  } } = require('../utils');

module.exports = {
  async create (request, response, next) {
    const { name, invite } = request.body;
    const { uid: currentUserId } = request.user;

    if (!name || name.split('').includes(' ')) {
      return response.status(400).send({
        msg: 'Provide a name without any spaces to create a new stream'
      });
    }

    let newStreamInvitees = [currentUserId];
    // FIXME: Smelly code
    if (invite) {
      if (typeof invite === 'string') {
        newStreamInvitees = [
          ...newStreamInvitees,
          ...invite.split(',').map(id => id.trim()).filter(id => id)
        ];
      } else if (Array.isArray(invite)) {
        newStreamInvitees = [...newStreamInvitees, ...invite.filter(id => id)];
      } else {
        return response.status(400).send({
          msg: 'Provide an array or comma-separated string of IDs of users to invite',
        });
      }
    }

    try {
      const streamAlreadyExists = await Stream.findOne({ where: { name } });

      if (streamAlreadyExists) {
        return response.status(422).send({
          msg: `A stream called ${name} already exists`
        });
      }

      const newStream = await Stream.create(request.body);
      await newStream.addUsers(newStreamInvitees);

      return response.status(201).send({
        msg: `Stream named ${name} created successfully`,
        stream: newStream
      });
    } catch (error) {
      next(error);
    }
  },

  async fetchAll (request, response, next) {
    const {
      sort,
      perPage: limit = CONSTANTS.DEFAULT_PAGE_LIMIT,
      page = CONSTANTS.DEFAULT_PAGE_NUMBER,
      q,
      include,
      startDate,
      endDate,
    } = request.query;

    // Query pre-processing
    const {
      parsedLimit,
      parsedPageNumber,
      offset,
      sortMatrix,
      includeAttributesMatrix
    } = processQueryString({ sort, limit, page, include });

    const options = {
      where: {
        isPrivate: false,
        ...q && {[Op.or]: [
          {
            name: {
              [Op.iLike]: `%${q}%`
            },
          },
          {
            description: {
              [Op.iLike]: `%${q}%`
            },
          }
        ]},
        ...startDate && {createdAt: {
          [Op.lt]: endDate || new Date(),
          [Op.gt]: startDate
        }},
      },
      ...sortMatrix.length > 0 && { order: sortMatrix },
      ...includeAttributesMatrix.length > 0 && { attributes: includeAttributesMatrix },
      limit: parsedLimit,
      offset,
    };

    try {
      const {rows: streams, count: totalCount} = await Stream.findAndCountAll(options);

      const totalPages = Math.ceil(totalCount/parsedLimit);
      const paginationLinks = generatePaginationLinks(request.originalUrl, parsedPageNumber, totalPages);
      const paginationResponse = generatePaginationResponse(paginationLinks, totalCount, totalPages);

      response.links(paginationLinks);
      response.set('X-Total-Count', totalCount);

      return response.status(200).send({
        msg: 'Streams retrieved successfully',
        streams,
        pagination: paginationResponse,
      });
    } catch (error) {
      next(error);
    }
  },

  async fetchOne (request, response, next) {
    const { streamId } = request.params;
    const { uid: currentUserId } = request.user;

    try {
      const stream = await Stream.findByPk(streamId, {
        include: {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'avatarUrl'],
        }
      });

      if (!stream) {
        return response.status(404).send({
          msg: `Stream with Id:${streamId} does not exist`
        });
      }

      const currentUserIsMemberOfStream = await stream.hasUser(currentUserId);

      if (currentUserIsMemberOfStream || !stream.isPrivate) {
        return response.status(200).send({
          msg: 'Stream retrieved successfully',
          stream
        });
      }

      return response.status(403).send({
        status: 403,
        msg: 'Forbidden',
      });
    } catch (error) {
      next(error);
    }
  },

  async join (request, response, next) {
    const { streamId } = request.params;
    const { uid: currentUserId = null }  = request.user;

    try {
      const user = await User.findByPk(currentUserId);
      const stream = await Stream.findByPk(streamId);

      if (!stream) {
        return response.status(404).send({
          msg: `Stream with ID: ${streamId} does not exist`
        })
      }

      if (stream.isPrivate) {
        return response.status(403).send({
          msg: 'Forbidden'
        });
      }

      const isUserMemberOfStream = await stream.hasUser(user);

      if (isUserMemberOfStream) {
        return response.status(422).send({
          msg: 'User is already a member of this stream'
        })
      }

      await stream.addUser(currentUserId);

      return response.status(200).send({
        status: 200,
        msg: `User has joined stream with ID: ${streamId} successfully`
      });
    } catch (error) {
      next(error);
    }
  },

  async leave (request, response, next) {
    const { streamId } = request.params;
    const { uid: currentUserId = null }  = request.user;

    try {
      const user = await User.findByPk(currentUserId);
      const stream = await Stream.findByPk(streamId);

      if (!stream) {
        return response.status(404).send({
          msg: `Stream with ID: ${streamId} does not exist`
        })
      }

      const isUserMemberOfStream = await stream.hasUser(user);

      if (isUserMemberOfStream) {
        await stream.removeUser(currentUserId);

        return response.status(200).send({
          msg: 'User removed from stream successfully'
        })
      }

      return response.status(403).send({
        status: 403,
        msg: 'Forbidden'
      });
    } catch (error) {
      next(error);
    }
  },

  async addMembers (request, response, next) {
    const { uid: currentUserId } = request.user;
    const { members } = request.body;
    const { streamId } = request.params;

    let newMembers = [];
    // FIXME: Smelly code. DRY up
    if (members) {
      if (typeof members === 'string') {
        newMembers = [
          ...newMembers,
          ...members.split(',').map(id => id.trim()).filter(id => id)
        ];
      } else if (Array.isArray(members)) {
        newMembers = [...newMembers, ...members.filter(id => id)];
      } else {
        return response.status(400).send({
          msg: 'Provide an array or comma-separated string of IDs of members to add to the stream',
        });
      }
    }

    try {
      const user = await User.findByPk(currentUserId);
      const stream = await Stream.findByPk(streamId);

      if (!stream) {
        return response.status(404).send({
          msg: `Stream with ID ${streamId} does not exist`
        });
      }

      const isUserMemberOfStream = await stream.hasUser(currentUserId);

      if (!isUserMemberOfStream) {
        return response.status(403).send({
          status: 403,
          msg: 'Forbidden'
        });
      }

      await stream.addUsers(newMembers);

      return response.status(201).send({
        msg: 'New member(s) added to stream successfully'
      });
    } catch (error) {
      next(error);
    }

  },

  async archive (request, response, next) {
    const { streamId } = request.params;
    const { uid: currentUserId = null }  = request.user;

    try {
      const user = await User.findByPk(currentUserId);
      const stream = await Stream.findByPk(streamId);

      if (!stream) {
        return response.status(404).send({
          msg: `Stream with ID: ${streamId} does not exist`
        })
      }

      const isUserMemberOfStream = await stream.hasUser(user);

      if (isUserMemberOfStream) {
        await stream.update({ isArchived: true });

        return response.status(200).send({
          msg: 'Stream archived successfully'
        })
      }

      return response.status(403).send({
        msg: 'Forbidden'
      });
    } catch (error) {
      next(error);
    }
  },

  async restore (request, response, next) {
    const { streamId } = request.params;
    const { uid: currentUserId = null }  = request.user;

    try {
      const user = await User.findByPk(currentUserId);
      const stream = await Stream.findByPk(streamId);

      if (!stream) {
        return response.status(404).send({
          msg: `Stream with ID: ${streamId} does not exist`
        })
      }

      const isUserMemberOfStream = await stream.hasUser(user);

      if (isUserMemberOfStream) {
        await stream.update({ isArchived: false });

        return response.status(200).send({
          msg: 'Stream restored successfully'
        })
      }

      return response.status(403).send({
        msg: 'Forbidden'
      });
    } catch (error) {
      next(error);
    }
  },
};