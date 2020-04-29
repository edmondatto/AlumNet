const { Post, Comment, Stream } = require('../models');

module.exports = {
  async create (request, response, next) {
    const { content } = request.body;
    const { uid: authorId }  = request.user;
    const { streamId } = request.params;

    if (!content) {
      return response.status(400).send({
        msg: 'Must provide content to create a post'
      })
    }

    try {
      // Handle requests via /api/streams/:streamId/posts
      if (streamId) {
        const stream = await Stream.findByPk(streamId);

        if (!stream) {
          return response.status(404).send({
            msg: `Stream with ID:${streamId} does not exist`
          });
        }

        const authorIsMemberOfStream = await stream.hasUser(authorId);

        if (!authorIsMemberOfStream) {
          return response.status(403).send({
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
        msg: 'Post created successfully',
        post: newPost
      });
    } catch (error) {
      next(error);
    }
  },

  async fetchPosts (request, response, next) {
    const { uid: currentUserId }  = request.user;
    const { streamId } = request.params;

    try {
      // Handle requests via /api/streams/:streamId/posts
      let stream, posts, totalCount;
      if (streamId) {
        stream = await Stream.findByPk(streamId);

        if (!stream) {
          return response.status(404).send({
            msg: `Stream with ID:${streamId} does not exist`
          });
        }

        const currentUserIsMemberOfStream = await stream.hasUser(currentUserId);

        if (!currentUserIsMemberOfStream && stream.isPrivate) {
          return response.status(403).send({
            msg: 'Forbidden'
          })
        }

        posts = await stream.getPosts();
        totalCount = await stream.countPosts()
      } else {
        const { count , rows } = await Post.findAndCountAll({ where: { streamId: null } });
        posts = rows;
        totalCount = count;
      }

      return response.status(200).send({
        msg: 'Posts retrieved successfully',
        posts,
        totalCount
      });
    } catch (error) {
      next(error);
    }
  },

  async fetchOne (request, response, next) {
    const { postId, streamId } = request.params;
    const { uid: currentUserId } = request.user;

    try {
      // Handle requests via /api/streams/:streamId/posts
      let stream, post;
      if (streamId) {
        stream = await Stream.findByPk(streamId);

        if (!stream) {
          return response.status(404).send({
            msg: `Stream with ID:${streamId} does not exist`
          });
        }

        const currentUserIsMemberOfStream = await stream.hasUser(currentUserId);

        if (!currentUserIsMemberOfStream && stream.isPrivate) {
          return response.status(403).send({
            msg: 'Forbidden'
          })
        }

        post = await stream.getPosts({ where: { id: postId } });
      } else {
        post = await Post.findOne({ where: { id: postId }, include: { model: Comment } });

        if (post && post.streamId) {
          return response.status(403).send({
            msg: 'Forbidden'
          });
        }
      }

      if (post) {
        return response.status(200).send({
          msg: 'Post retrieved successfully',
          post
        });
      } else {
        return response.status(404).send({
          msg: `Post with ID ${postId} does not exist`
        });
      }

    } catch (error) {
      next(error);
    }
  },

  async update (request, response, next) {
    // TODO: Extract as helper to check for empty body
    if (Object.keys(request.body).length === 0 || !request.body.content.length) {
      return response.status(400).send({
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
            msg: `Stream with ID:${streamId} does not exist`
          });
        }

        const currentUserIsMemberOfStream = await stream.hasUser(currentUserId);

        if (!currentUserIsMemberOfStream) {
          return response.status(403).send({
            msg: 'Forbidden'
          })
        }

        // This asynchronous call returns an array of results
        postToUpdate = (await stream.getPosts({ where: { id: postId } }))[0];
      } else {
        postToUpdate = await Post.findByPk(postId);
        if (postToUpdate && postToUpdate.streamId) {
          return response.status(403).send({
            msg: 'Forbidden'
          });
        }
      }

      if (!postToUpdate) {
        return response.status(404).send({
          msg: `Post with ID: ${postId} does not exist`
        });
      }

      if (postToUpdate.authorId !== currentUserId) {
        return response.status(403).send({
          msg: 'Forbidden'
        });
      }

      const updatedPost = await postToUpdate.update({...request.body, isEdited: true});

      return response.status(200).send({
        msg: `Post with ID: ${postId} has been updated successfully`,
        post: updatedPost
      });
    } catch (error) {
      next(error);
    }
  },

  async delete (request, response, next) {
    const { postId } = request.params;
    const { uid: userId = null }  = request.user;

    try {
      const postToDelete = await Post.findByPk(postId);

      if (!postToDelete) {
        return response.status(404).send({
          msg: `Post with ID: ${postId} does not exist`
        });
      }

      if (postToDelete.authorId !== userId) {
        return response.status(403).send({
          msg: 'Forbidden'
        });
      }

      await Post.destroy({
        where: {
          id: postId
        }
      });

      return response.status(200).send({
        msg: `Post with ID: ${postId} has been deleted successfully`
      });

    } catch (error) {
      next(error);
    }
  },
};