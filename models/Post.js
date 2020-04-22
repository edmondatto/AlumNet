module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('post', {
    title: {
      type: DataTypes.STRING,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    published: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    public: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    }
  });

  Post.associate = (models) => {
    Post.belongsTo(models.User, {
      foreignKey: 'authorId',
    });

    Post.belongsTo(models.Class);

    Post.hasMany(models.Comment);
  };
  return Post;
};