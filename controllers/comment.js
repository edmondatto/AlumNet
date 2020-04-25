const { Post, Comment } = require('../models');

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
      const parentPostExists = await Post.findByPk(postId);

      if (!parentPostExists) {
        return response.status(400).send({
          status: 400,
          msg: `Parent post with ID:${postId} does not exist`
        });
      }

      const newComment = await Comment.create({
        content,
        postId,
        authorId
      });

      return response.status(201).send({
        status: 201,
        msg: 'Comment created successfully',
        newComment
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

    try {
      // TODO: Add Where clause to retrieve "archived" posts. Return comments as long as parent post has ever existed
      const post = await Post.findByPk(postId);

      if (!post) {
        return response.status(404).send({
          status: 404,
          msg: `Post with ID:${postId} does not exist`
        });
      }

      const comments = await Comment.findAll({
        where: {
          postId: postId
        },
      });

      return response.status(200).send({
        status: 200,
        msg: 'Comments retrieved successfully',
        comments
      });
    } catch (error) {
      return response.status(500).send({
        status: 500,
        msg: 'Internal server error',
        error
      });
    }
  },

  async fetchById (request, response) {
    const { postId, commentId } = request.params;

    try {
      const post = await Post.findByPk(postId);

      if (!post) {
        return response.status(404).send({
          status: 404,
          msg: `Post with ID:${postId} does not exist`
        });
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

  // TODO: DRY up the code to check entities to be updated/deleted
  async update (request, response) {
    if (Object.keys(request.body).length === 0) {
      return response.status(400).send({
        status: 400,
        msg: 'Bad request: No updates received'
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
        post: updatedComment

      });
    } catch (error) {
      return response.status(500).send({
        status: 500,
        msg: 'Internal server error'
      });
    }
  },

  async delete (request, response, next) {
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