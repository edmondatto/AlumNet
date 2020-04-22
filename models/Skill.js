module.exports = (sequelize, DataTypes) => {
  const Skill = sequelize.define('skill', {
    title: {
      type: DataTypes.STRING,
    },
  });

  Skill.associate = (models) => {
    Skill.belongsToMany(models.User, {
      through: 'user_skills'
    });
  };
  return Skill;
};