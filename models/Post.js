module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('post', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_published',
    },

    isEdited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_edited',
    },
  });

  Post.associate = (models) => {
    Post.belongsTo(models.User, {
      foreignKey: 'authorId',
    });

    Post.belongsTo(models.Stream);

    Post.hasMany(models.Comment);
  };
  return Post;
};