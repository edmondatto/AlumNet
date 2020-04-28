const { Post, Comment, Stream } = require('../models');

module.exports = {
  async create (request, response) {
    const { postId } = request.params;
    const { uid: authorId } = request.user;
    const { content } = request.body;

    if (!content) {
      return response.status(400).send({
        status: 400,
        msg: 'Must provide content to create a comment'
      })
    }

    try {
      const parentPost = await Post.findByPk(postId);

      if (!parentPost) {
        return response.status(400).send({
          status: 400,
          msg: `Parent post with ID:${postId} does not exist`
        });
      }

      // Handle case of creating a comment on a post in a stream
      if (parentPost.streamId) {
        const stream = await Stream.findByPk(parentPost.streamId);
        const isAuthorMemberOfStream = await stream.hasUser(authorId);

        if (!isAuthorMemberOfStream) {
          return response.status(403).send({
            status: 403,
            msg: 'Forbidden'
          });
        }
      }

      const comment = await Comment.create({
        content,
        postId,
        authorId
      });

      return response.status(201).send({
        status: 201,
        msg: 'Comment created successfully',
        comment
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
    const { postId } = request.params;
    const { uid: authorId } = request.user;

    try {
      // TODO: Add Where clause to retrieve "archived" posts. Return comments as long as parent post has ever existed

      const post = await Post.findByPk(postId);

      if (!post) {
        return response.status(404).send({
          status: 404,
          msg: `Post with ID:${postId} does not exist`
        });
      }

      // Handle case of fetching comments on a post in a stream
      if (post.streamId) {
        const stream = await Stream.findByPk(post.streamId);
        const isAuthorMemberOfStream = await stream.hasUser(authorId);

        if (!isAuthorMemberOfStream) {
          return response.status(403).send({
            status: 403,
            msg: 'Forbidden'
          });
        }
      }

      const {rows: comments, count: totalCount} = await Comment.findAndCountAll({
        where: {
          postId: postId
        },
      });

      return response.status(200).send({
        status: 200,
        msg: 'Comments retrieved successfully',
        comments,
        totalCount
      });
    } catch (error) {
      return response.status(500).send({
        status: 500,
        msg: 'Internal server error'
      });
    }
  },

  async fetchById (request, response) {
    const { postId, commentId } = request.params;
    const { uid: currentUserId } = request.user;

    try {
      const post = await Post.findByPk(postId);

      if (!post) {
        return response.status(404).send({
          status: 404,
          msg: `Post with ID:${postId} does not exist`
        });
      }

      // Handle case of fetching a comment on a post in a stream
      if (post.streamId) {
        const stream = await Stream.findByPk(post.streamId);
        const isCurrentUserMemberOfStream = await stream.hasUser(currentUserId);

        if (!isCurrentUserMemberOfStream) {
          return response.status(403).send({
            status: 403,
            msg: 'Forbidden'
          });
        }
      }

      const comment = await Comment.findByPk(commentId);

      if (!comment) {
        return response.status(404).send({
          status: 404,
          msg: `Comment with ID:${commentId} does not exist`
        });
      }

      if (post.id !== comment.postId) {
        return response.status(404).send({
          status: 404,
          msg: `Post with ID:${postId} does not have a comment with ID:${commentId}`
        });
      }

      return response.status(200).send({
        status: 200,
        msg: 'Comment retrieved successfully',
        comment
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
    // TODO: DRY up the code to check entities to be updated/deleted
    if (Object.keys(request.body).length === 0 || !request.body.content.length) {
      return response.status(400).send({
        status: 400,
        msg: 'No updates received/Empty string'
      });
    }

    const { uid: currentUserId = null } = request.user;
    const { commentId, postId } = request.params;

    try {
      const commentToUpdate = await Comment.findByPk(commentId);

      if (!commentToUpdate) {
        return response.status(404).send({
          status: 404,
          msg: `Comment with ID: ${commentId} does not exist`
        });
      }

      if (commentToUpdate.authorId !== currentUserId) {
        return response.status(403).send({
          status: 403,
          msg: 'Forbidden'
        });
      }

      if (commentToUpdate.postId !== postId) {
        return response.status(404).send({
          status: 404,
          msg: `Post with ID:${postId} does not have a comment with ID:${commentId}`
        });
      }

      const updatedComment = await commentToUpdate.update({...request.body, isEdited: true});

      return response.status(200).send({
        status: 200,
        msg: `Comment with ID: ${commentId} has been updated successfully`,
        comment: updatedComment
      });
    } catch (error) {
      return response.status(500).send({
        status: 500,
        msg: 'Internal server error'
      });
    }
  },

  async delete (request, response) {
    const { commentId, postId } = request.params;
    const { uid: currentUserId = null }  = request.user;

    try {
      const commentToDelete = await Comment.findByPk(commentId);

      if (!commentToDelete) {
        return response.status(404).send({
          status: 404,
          msg: `Comment with ID: ${commentId} does not exist`
        });
      }

      if (commentToDelete.authorId !== currentUserId) {
        return response.status(403).send({
          status: 403,
          msg: 'Forbidden'
        });
      }

      if (commentToDelete.postId !== postId) {
        return response.status(404).send({
          status: 404,
          msg: `Post with ID:${postId} does not have a comment with ID:${commentId}`
        });
      }

      await Comment.destroy({
        where: {
          id: commentId
        }
      });

      return  response.status(200).send({
        status: 200,
        msg: `Comment with ID: ${commentId} has been deleted successfully`
      });

    } catch (error) {
      return response.status(500).send({
        status: 500,
        msg: 'Internal server error',
      });
    }
  },
};