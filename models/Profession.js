module.exports = (sequelize, DataTypes) => {
  const Profession = sequelize.define('profession', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    name: {
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