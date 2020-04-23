const { Post } = require('../models');

module.exports = {
  async create (request, response) {
    const { content } = request.body;
    const { uid: authorId }  = request.user;

    if (content) {
      try {
        const newPost = await Post.create({...request.body, authorId});

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

    } else {
      return response.status(400).send({
        status: 400,
        msg: 'Must provide content to create a post'
      })
    }
  },

  async fetchPublicPosts (request, response) {
    try {
      const posts = await Post.findAll({
        where: {
          isPublic: true,
          isPublished: true
        }
      });

      return response.status(200).send({
        status: 201,
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
    const { postId } = request.params;

    try {
      const post = await Post.findByPk(postId);

      if (post) {
        return response.status(200).send({
          status: 201,
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
        msg: 'Internal server error'
      });
    }
  },

  async update (request, response) {
    if (Object.keys(request.body).length === 0) {
      return response.status(400).send({
        status: 400,
        msg: 'Bad request: No updates received'
      });
    }

    const { postId } = request.params;
    const { uid: userId = null }  = request.user;

    try {
      const postToUpdate = await Post.findByPk(postId);

      if (!postToUpdate) {
        return response.status(404).send({
          status: 404,
          msg: `Post with ID: ${postId} does not exist`
        });
      }

      if (postToUpdate.authorId !== userId) {
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

      try {
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
          msg: 'Internal server error'
        });
      }

    } catch (error) {
      return response.status(500).send({
        status: 500,
        msg: 'Internal server error',
      });
    }
  },
};