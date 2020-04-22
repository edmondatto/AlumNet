const express = require('express');
require('dotenv').config();
const bodyParser = require('body-parser');

const app = express();
const models = require('./models');

// API Router Import
const { authRouter } = require('./routes');

// Application Level Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: 'false'}));

// API Routes
app.use('/auth', authRouter);

// Start API Server
models.sequelize.sync({force: true}).then(() =>
  app.listen(process.env.PORT_NUMBER, () => {
    console.log(`Listening on Port ${process.env.PORT_NUMBER}..`)
}));
