const { Post, Comment, Stream, Sequelize: { Op } } = require('../models');
const {
  CONSTANTS,
  helpers: {
    processQueryString,
    generatePaginationInfo,
  } } = require('../utils');

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
    const {
      sort,
      perPage: limit = CONSTANTS.DEFAULT_PAGE_LIMIT,
      page = CONSTANTS.DEFAULT_PAGE_NUMBER,
      q,
      include,
      startDate,
      endDate,
      author,
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
        ...!streamId && { streamId: null },
        ...q && {
          content: {
            [Op.iLike]: `%${q}%`
          },
        },
        ...startDate && {createdAt: {
          [Op.lt]: endDate || new Date(),
          [Op.gt]: startDate
        }},
        ...author && { authorId: author },
      },
      // FIXME: Sort throws Group_By error for /api/streams/:streamId/posts
      ...sortMatrix.length > 0 && { order: sortMatrix },
      ...includeAttributesMatrix.length > 0 && { attributes: includeAttributesMatrix },
      limit: parsedLimit,
      offset,
    };

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

        // TODO: avoid hitting the DB twice
        posts = await stream.getPosts(options);
        totalCount = await stream.countPosts(options)
      } else {
        // Handle requests via /posts
        const { count, rows } = await Post.findAndCountAll(options);
        posts = rows;
        totalCount = count;
      }

      const {
        paginationLinks,
        paginationResponse
      } = generatePaginationInfo(request.originalUrl, totalCount, parsedLimit, parsedPageNumber);

      response.links(paginationLinks);
      response.set('X-Total-Count', totalCount);

      return response.status(200).send({
        msg: 'Posts retrieved successfully',
        posts,
        pagination: paginationResponse,
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