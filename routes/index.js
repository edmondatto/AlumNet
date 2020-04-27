const authRouter = require('./auth');
const postRouter = require('./post');
const classRouter = require('./class');
const userRouter = require('./user');
const commentRouter = require('./comment');
const skillRouter = require('./skill');
const professionRouter = require('./profession');
const eventRouter = require('./event');
const streamRouter = require('./stream');

module.exports = {
  authRouter,
  postRouter,
  classRouter,
  userRouter,
  commentRouter,
  skillRouter,
  professionRouter,
  eventRouter,
  streamRouter,
};