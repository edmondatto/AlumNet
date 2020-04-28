const { Post, Comment, Stream } = require('../models');

module.exports = {
  async create (request, response) {
    const { content } = request.body;
    const { uid: authorId }  = request.user;
    const { streamId } = request.params;

    if (!content) {
      return response.status(400).send({
        status: 400,
        msg: 'Must provide content to create a post'
      })
    }

    try {
      // Handle requests via /api/streams/:streamId/posts
      if (streamId) {
        const stream = await Stream.findByPk(streamId);

        if (!stream) {
          return response.status(404).send({
            status: 404,
            msg: `Stream with ID:${streamId} does not exist`
          });
        }

        const authorIsMemberOfStream = await stream.hasUser(authorId);

        if (!authorIsMemberOfStream) {
          return response.status(403).send({
            status: 403,
            msg: 'Forbidden'
          })
        }
      }

      const newPost = await Post.create({
        authorId,
        ...request.body,
        ...streamId && { streamId },
      });

      return response.status(201).send({
        status: 201,
        msg: 'Post created successfully',
        post: newPost
      });
    } catch (error) {
      return response.status(500).send({
        status: 500,
        msg: 'Internal server error',
      });
    }
  },

  async fetchPosts (request, response) {
    const { uid: currentUserId }  = request.user;
    const { streamId } = request.params;

    try {
      // Handle requests via /api/streams/:streamId/posts
      let stream, posts;
      if (streamId) {
        stream = await Stream.findByPk(streamId);

        if (!stream) {
          return response.status(404).send({
            status: 404,
            msg: `Stream with ID:${streamId} does not exist`
          });
        }

        const currentUserIsMemberOfStream = await stream.hasUser(currentUserId);

        if (!currentUserIsMemberOfStream && stream.isPrivate) {
          return response.status(403).send({
            status: 403,
            msg: 'Forbidden'
          })
        }

        posts = await stream.getPosts();
      } else {
        posts = await Post.findAll({ where: { streamId: null } });
      }

      return response.status(200).send({
        status: 200,
        msg: 'Posts retrieved successfully',
        posts
      });
    } catch (error) {
      return response.status(500).send({
        status: 500,
        msg: 'internal server error'
      });
    }
  },

  async fetchOne (request, response) {
    const { postId, streamId } = request.params;
    const { uid: currentUserId } = request.user;

    try {
      // Handle requests via /api/streams/:streamId/posts
      let stream, post;
      if (streamId) {
        stream = await Stream.findByPk(streamId);

        if (!stream) {
          return response.status(404).send({
            status: 404,
            msg: `Stream with ID:${streamId} does not exist`
          });
        }

        const currentUserIsMemberOfStream = await stream.hasUser(currentUserId);

        if (!currentUserIsMemberOfStream && stream.isPrivate) {
          return response.status(403).send({
            status: 403,
            msg: 'Forbidden'
          })
        }

        post = await stream.getPosts({ where: { id: postId } });
      } else {
        post = await Post.findOne({ where: { id: postId }, include: { model: Comment } });
        if (post && post.streamId) {
          return response.status(403).send({
            status: 403,
            msg: 'Forbidden'
          });
        }
      }

      if (post) {
        return response.status(200).send({
          status: 200,
          msg: 'Post retrieved successfully',
          post
        });
      } else {
        return response.status(404).send({
          status: 404,
          msg: `Post with ID ${postId} does not exist`
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

  async update (request, response) {
    // TODO: Extract as helper to check for empty body
    if (Object.keys(request.body).length === 0 || !request.body.content.length) {
      return response.status(400).send({
        status: 400,
        msg: 'No updates received/Empty string'
      });
    }

    const { streamId, postId } = request.params;
    const { uid: currentUserId = null }  = request.user;

    try {
      // Handle requests via /api/streams/:streamId/posts
      let stream, postToUpdate;
      if (streamId) {
        stream = await Stream.findByPk(streamId);

        if (!stream) {
          return response.status(404).send({
            status: 404,
            msg: `Stream with ID:${streamId} does not exist`
          });
        }

        const currentUserIsMemberOfStream = await stream.hasUser(currentUserId);

        if (!currentUserIsMemberOfStream) {
          return response.status(403).send({
            status: 403,
            msg: 'Forbidden'
          })
        }

        // This asynchronous call returns an array of results
        postToUpdate = (await stream.getPosts({ where: { id: postId } }))[0];
      } else {
        postToUpdate = await Post.findByPk(postId);
        if (postToUpdate && postToUpdate.streamId) {
          return response.status(403).send({
            status: 403,
            msg: 'Forbidden'
          });
        }
      }

      if (!postToUpdate) {
        return response.status(404).send({
          status: 404,
          msg: `Post with ID: ${postId} does not exist`
        });
      }

      if (postToUpdate.authorId !== currentUserId) {
        return response.status(403).send({
          status: 403,
          msg: 'Forbidden'
        });
      }

      const updatedPost = await postToUpdate.update({...request.body, isEdited: true});

      return response.status(200).send({
        status: 200,
        msg: `Post with ID: ${postId} has been updated successfully`,
        post: updatedPost
      });
    } catch (error) {
      return response.status(500).send({
        status: 500,
        msg: 'Internal server error'
      });
    }
  },

  async delete (request, response) {
    const { postId } = request.params;
    const { uid: userId = null }  = request.user;

    try {
      const postToDelete = await Post.findByPk(postId);

      if (!postToDelete) {
        return response.status(404).send({
          status: 404,
          msg: `Post with ID: ${postId} does not exist`
        });
      }

      if (postToDelete.authorId !== userId) {
        return response.status(403).send({
          status: 403,
          msg: 'Forbidden'
        });
      }

      await Post.destroy({
        where: {
          id: postId
        }
      });

      return  response.status(200).send({
        status: 200,
        msg: `Post with ID: ${postId} has been deleted successfully`
      });

    } catch (error) {
      return response.status(500).send({
        status: 500,
        msg: 'Internal server error',
      });
    }
  },
};