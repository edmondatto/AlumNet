module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    id: {
      type: DataTypes.STRING,
      autoIncrement: false,
      primaryKey: true,
    },

    firstName: {
      type: DataTypes.STRING,
      field: 'first_name',
    },

    lastName: {
      type: DataTypes.STRING,
      field: 'last_name',
    },

    username: {
      type: DataTypes.STRING,
      unique: true,
    },

    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: {
          args: true,
          msg: "Must be a valid email address",
        },
      }
    },

    avatarUrl: {
      type: DataTypes.STRING,
      field: 'avatar_url',
      validate: {
        isUrl: {
          args: true,
          msg: "Must be a valid URL"
        }
      }
    },

    bio: {
      type: DataTypes.TEXT,
    },

    birthday: {
      type: DataTypes.DATEONLY,
      validate: {
        isDate: {
          args: true,
          msg: 'Must be a valid date'
        }
      }
    },

    personalWebsite: {
      type: DataTypes.STRING,
      field: 'personal_website',
    },

    // TODO: Explore using a JSON(B) object for the socials
    twitterProfile: {
      type: DataTypes.STRING,
      field: 'twitter_profile',
      validate: {
        isUrl: {
          args: true,
          msg: "Must be a valid URL"
        }
      }
    },

    telephoneNumber: {
      type: DataTypes.INTEGER,
      field: 'telephone_number'
    },
  });

  User.associate = (models) => {
    User.hasMany(models.Post, {
      foreignKey: 'authorId',
    });

    User.hasMany(models.Comment, {
      foreignKey: 'authorId',
    });

    User.belongsTo(models.Profession);

    User.belongsToMany(models.Skill, {
      through: 'UserSkills'
    });

    User.hasMany(models.Event, {
      foreignKey: 'organiserId',
    });

    User.belongsToMany(models.Stream, {
      through: 'UserStreams'
    });
  };

  return User;

};
