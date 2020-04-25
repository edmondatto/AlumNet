const authRouter = require('./auth');
const postRouter = require('./post');
const classRouter = require('./class');
const userRouter = require('./user');
const commentRouter = require('./comment');
const skillRouter = require('./skill');
const professionRouter = require('./profession');

module.exports = {
  authRouter,
  postRouter,
  classRouter,
  userRouter,
  commentRouter,
  skillRouter,
  professionRouter,
};