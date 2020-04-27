module.exports = (sequelize, DataTypes) => {
  const Stream = sequelize.define('stream', {
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

    description: {
      type: DataTypes.STRING,
    },

    isPrivate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    isArchived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  Stream.associate = (models) => {
    Stream.belongsToMany(models.User, {
      through: 'UserStreams'
    });

    Stream.hasMany(models.Post);
  };

  return Stream;
};