const { postController } = require('../controllers');

const postRouter = require('express').Router();

postRouter.post('/', postController.create);
postRouter.get('/', postController.fetchPublicPosts);
postRouter.get('/:postId', postController.fetchOne);
postRouter.delete('/:postId', postController.delete);
postRouter.put('/:postId', postController.update);


module.exports = postRouter;
