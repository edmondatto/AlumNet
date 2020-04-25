const authRouter = require('./auth');
const postRouter = require('./post');
const classRouter = require('./class');
const userRouter = require('./user');
const commentRouter = require('./comment');

module.exports = {
  authRouter,
  postRouter,
  classRouter,
  userRouter,
  commentRouter,
};