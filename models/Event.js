module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define('event', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    published: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    coverImage: {
      type: DataTypes.STRING,
      validate: {
        isUrl: {
          args: true,
          msg: 'Must be a valid URL',
        }
      }
    },
    // TODO: Find fix for Geometry DataType
    // location: {
    //   type: DataTypes.GEOMETRY('POINT'),
    // },
  });

  Event.associate = (models) => {
    Event.belongsTo(models.User, {
      foreignKey: 'ownerId',
    });
  };
  return Event;
};