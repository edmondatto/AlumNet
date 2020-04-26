module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define('event', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

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
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_published',
    },

    coverImage: {
      type: DataTypes.STRING,
      field: 'cover_image',
      validate: {
        isUrl: {
          args: true,
          msg: 'Must be a valid URL',
        }
      }
    },

    isEdited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    // TODO: Find fix for Geometry DataType
    // location: {
    //   type: DataTypes.GEOMETRY('POINT'),
    // },
  });

  Event.associate = (models) => {
    Event.belongsTo(models.User, {
      foreignKey: 'organiserId',
    });
  };
  return Event;
};