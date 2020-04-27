const { Stream, User } = require('../models');

module.exports = {
  async create (request, response) {
    const { name, invite } = request.body;
    const { uid: currentUserId } = request.user;

    if (!name || name.split('').includes(' ')) {
      return response.status(400).send({
        status: 400,
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
          status: 400,
          msg: 'Provide an array or comma-separated string of IDs of users to invite',
        });
      }
    }

    try {
      const streamAlreadyExists = await Stream.findOne({ where: { name } });

      if (streamAlreadyExists) {
        return response.status(400).send({
          status: 400,
          msg: `A stream called ${name} already exists`
        });
      }

      const newStream = await Stream.create(request.body);
      console.log('===>>>>', newStreamInvitees);
      await newStream.addUsers(newStreamInvitees);

      return response.status(201).send({
        status: 201,
        msg: `Stream named ${name} created successfully`,
        stream: newStream
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
      const {rows: streams, count: totalCount} = await Stream.findAndCountAll({
        where: {
          isPrivate: false
        }
      });

      return response.status(200).send({
        status: 200,
        msg: 'Streams retrieved successfully',
        streams,
        totalCount
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
    const { streamId } = request.params;
    const { uid: currentUserId } = request.user;

    try {
      const stream = await Stream.findByPk(streamId);

      if (!stream) {
        return response.status(404).send({
          status: 404,
          msg: `Stream with Id:${streamId} does not exist`
        });
      }

      const currentUserIsMemberOfStream = await stream.hasUser(currentUserId);

      if (currentUserIsMemberOfStream || !stream.isPrivate) {
        return response.status(200).send({
          status: 200,
          msg: 'Stream retrieved successfully',
          stream
        });
      }

      return response.status(403).send({
        status: 403,
        msg: 'Forbidden',
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
    const { streamId } = request.params;
    const { uid: currentUserId = null }  = request.user;

    try {
      const user = await User.findByPk(currentUserId);
      const stream = await Stream.findByPk(streamId);

      if (!stream) {
        return response.status(404).send({
          status: 404,
          msg: `Stream with ID: ${streamId} does not exist`
        })
      }

      if (stream.isPrivate) {
        return response.status(403).send({
          status: 403,
          msg: 'Forbidden'
        });
      }

      const isUserMemberOfStream = await stream.hasUser(user);

      if (isUserMemberOfStream) {
        return response.status(200).send({
          status: 200,
          msg: 'User is already a member of this stream'
        })
      }

      await stream.addUser(currentUserId);

      return response.status(200).send({
        status: 200,
        msg: `User has joined stream with ID: ${streamId} successfully`
      });
    } catch (error) {
      return response.status(500).send({
        status: 500,
        msg: 'Internal server error',
        error
      });
    }
  },

  async leave (request, response) {
    const { streamId } = request.params;
    const { uid: currentUserId = null }  = request.user;

    try {
      const user = await User.findByPk(currentUserId);
      const stream = await Stream.findByPk(streamId);

      if (!stream) {
        return response.status(404).send({
          status: 404,
          msg: `Stream with ID: ${streamId} does not exist`
        })
      }

      const isUserMemberOfStream = await stream.hasUser(user);

      if (isUserMemberOfStream) {
        await stream.removeUser(currentUserId);

        return response.status(200).send({
          status: 200,
          msg: 'User removed from stream successfully'
        })
      }

      return response.status(403).send({
        status: 403,
        msg: 'Forbidden'
      });
    } catch (error) {
      return response.status(500).send({
        status: 500,
        msg: 'Internal server error',
        error
      });
    }
  },

  async addMembers (request, response) {
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
          status: 400,
          msg: 'Provide an array or comma-separated string of IDs of members to add to the stream',
        });
      }
    }

    try {
      const user = await User.findByPk(currentUserId);
      const stream = await Stream.findByPk(streamId);

      if (!stream) {
        return response.status(404).send({
          status: 404,
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
        status: 201,
        msg: 'New member(s) added to stream successfully'
      });
    } catch (error) {
      return response.status(500).send({
        status: 500,
        msg: 'Internal server error',
        error
      });
    }

  },

  async archive (request, response) {
    const { streamId } = request.params;
    const { uid: currentUserId = null }  = request.user;

    try {
      const user = await User.findByPk(currentUserId);
      const stream = await Stream.findByPk(streamId);

      if (!stream) {
        return response.status(404).send({
          status: 404,
          msg: `Stream with ID: ${streamId} does not exist`
        })
      }

      const isUserMemberOfStream = await stream.hasUser(user);

      if (isUserMemberOfStream) {
        await stream.update({ isArchived: true });

        return response.status(200).send({
          status: 200,
          msg: 'Stream archived successfully'
        })
      }

      return response.status(403).send({
        status: 403,
        msg: 'Forbidden'
      });
    } catch (error) {
      return response.status(500).send({
        status: 500,
        msg: 'Internal server error',
        error
      });
    }
  },

  async restore (request, response) {
    const { streamId } = request.params;
    const { uid: currentUserId = null }  = request.user;

    try {
      const user = await User.findByPk(currentUserId);
      const stream = await Stream.findByPk(streamId);

      if (!stream) {
        return response.status(404).send({
          status: 404,
          msg: `Stream with ID: ${streamId} does not exist`
        })
      }

      const isUserMemberOfStream = await stream.hasUser(user);

      if (isUserMemberOfStream) {
        await stream.update({ isArchived: false });

        return response.status(200).send({
          status: 200,
          msg: 'Stream restored successfully'
        })
      }

      return response.status(403).send({
        status: 403,
        msg: 'Forbidden'
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