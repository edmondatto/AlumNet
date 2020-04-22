module.exports = (sequelize, DataTypes) => {
  const Class = sequelize.define('class', {
    year: {
      type: DataTypes.STRING(4),
      allowNull: false,
      unique: true,
      validate: {
        isInt: {
          args: true,
          msg: 'Must be a number'
        },
        len: {
          args: 4,
          msg: 'Must be a length of 4 numbers'
        }
      }
    },
    image: {
      type: DataTypes.STRING,
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