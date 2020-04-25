const express = require('express');
require('dotenv').config();
const bodyParser = require('body-parser');

const app = express();
const models = require('./models');

// API Router Import
const { authRouter, postRouter, classRouter, userRouter, commentRouter } = require('./routes');

// API Custom Middleware Import
const { userIsLoggedIn } = require('./middleware');

// Application Level Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: 'false'}));

// API Routes
app.use('/auth', authRouter);
app.use('/posts', userIsLoggedIn, postRouter);
app.use('/posts', userIsLoggedIn, commentRouter);
app.use('/classes', userIsLoggedIn, classRouter);
app.use('/users', userIsLoggedIn, userRouter);

// Start API Server
models.sequelize.sync({alter: true}).then(() =>
  app.listen(process.env.PORT_NUMBER, () => {
    console.log(`Listening on Port ${process.env.PORT_NUMBER}...`)
}));
