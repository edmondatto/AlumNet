module.exports = (sequelize, DataTypes) => {
  const Skill = sequelize.define('skill', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
  });

  Skill.associate = (models) => {
    Skill.belongsToMany(models.User, {
      through: 'UserSkills'
    });
  };
  return Skill;
};