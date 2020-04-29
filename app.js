const express = require('express');
require('dotenv').config();
const bodyParser = require('body-parser');
const logger = require('morgan');
const fs = require('fs');
const path = require('path');

const app = express();
app.disable('x-powered-by');
const models = require('./models');

// API Router Import
const {
    authRouter,
    postRouter,
    userRouter,
    commentRouter,
    skillRouter,
    professionRouter,
    eventRouter,
    streamRouter,
} = require('./routes');

// API Custom Middleware Import
const { userIsLoggedIn, errorHandler, routeNotImplemented } = require('./middleware');

// Application Level Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: 'false'}));

// Create Error Log File
app.use(logger('combined', {
  skip: function (request, response) { return response.statusCode < 400 },
  stream: fs.createWriteStream(path.join(__dirname, 'errors.log'), { flags: 'a' })
}));

// Create Access Log File
app.use(logger('combined', {
  stream: fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
}));

// API Routes
app.use('/auth', authRouter);
app.use('/posts', userIsLoggedIn, postRouter);
app.use('/posts', userIsLoggedIn, commentRouter);
app.use('/events', userIsLoggedIn, eventRouter);
app.use('/streams', userIsLoggedIn, streamRouter);
app.use('/users', userIsLoggedIn, userRouter);
app.use('/skills', userIsLoggedIn, skillRouter);
app.use('/professions', userIsLoggedIn, professionRouter);
app.use(routeNotImplemented);

// Catch-all Error handler
app.use(errorHandler);

// Start API Server
models.sequelize.sync({alter: true}).then(() =>
  app.listen(process.env.PORT_NUMBER, () => {
    console.log(`Listening on Port ${process.env.PORT_NUMBER}...`)
}));
