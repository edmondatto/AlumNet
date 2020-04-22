module.exports = (sequelize, DataTypes) => {
  const Profession = sequelize.define('profession', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  });

  Profession.associate = (models) => {
    Profession.hasMany(models.User);
  };
  return Profession;
};