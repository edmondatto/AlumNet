module.exports = (sequelize, DataTypes) => {
  const Class = sequelize.define('class', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },

    imageUrl: {
      type: DataTypes.STRING,
      field: 'image_url',
      validate: {
        isUrl: {
          args: true,
          msg: 'Must be a valid URL'
        }
      }
    }
  });

  Class.associate = (models) => {
    Class.hasMany(models.User, {
      foreignKey: 'classId',
      as: 'members',
    });

    Class.hasMany(models.Post, {
      foreignKey: 'classId',
      as: 'feed',
    })
  };
  return Class;
};