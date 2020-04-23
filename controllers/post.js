const { Post } = require('../models');

module.exports = {
  async create(request, response) {
    const { content, isPublic, isPublished } = request.body;
    const { uid: authorId }  = request.user;

    if (content) {
      const newPostSchema = {
        content,
        authorId,
        ...isPublic && { isPublic },
        ...isPublished && { isPublished }
      };

      try {
        const newPost = await Post.create(newPostSchema);

        return response.status(201).send({
          status: 201,
          msg: 'Post created successfully',
          post: newPost
        });
      } catch (error) {
        return response.status(500).send({
          status: 500,
          msg: 'Internal server error'
        });
      }

    } else {
      return response.status(400).send({
        status: 400,
        msg: 'Must provide content to create a post'
      })
    }
  }
};