module.exports = (sequelize, DataTypes) => {
  const Skill = sequelize.define('skill', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      autoIncrement: false,
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
      through: 'user_skills'
    });
  };
  return Skill;
};