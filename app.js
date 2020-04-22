const express = require('express');
require('dotenv').config();
const bodyParser = require('body-parser');

const app = express();
const models = require('./models');
const { authController } = require('./controllers');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: 'false'}));

app.get('/', (r, rs) => rs.send('Welcome'));
app.post('/register', authController.registerUser);

models.sequelize.sync({force: true}).then(() =>
  app.listen(process.env.PORT_NUMBER, () => {
    console.log(`Listening on Port ${process.env.PORT_NUMBER}..`)
}));
