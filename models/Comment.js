module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('comment', {
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    published: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
  });

  Comment.associate = (models) => {
    Comment.belongsTo(models.Post);

    Comment.belongsTo(models.User, {
      foreignKey: 'authorId'
    });
  };
  return Comment;
};