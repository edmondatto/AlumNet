module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('comment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      autoIncrement: false,
      primaryKey: true,
    },

    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    published: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    isEdited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }

    // TODO: Add isDeleted?
  });

  Comment.associate = (models) => {
    Comment.belongsTo(models.Post);

    Comment.belongsTo(models.User, {
      foreignKey: 'authorId'
    });
  };
  return Comment;
};