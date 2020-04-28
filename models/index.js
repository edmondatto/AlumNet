const Sequelize = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    dialect: 'postgres',
    define: {
      underscored: true
    }
  }
);

const models = {
  User: sequelize.import('./User'),
  Comment: sequelize.import('./Comment'),
  Event: sequelize.import('./Event'),
  Post: sequelize.import('./Post'),
  Profession: sequelize.import('./Profession'),
  Skill: sequelize.import('./Skill'),
  Stream: sequelize.import('./Stream'),
};

Object.keys(models).forEach(modelName => {
  if('associate' in models[modelName]) {
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;


