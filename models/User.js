module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    userId: {
      type: DataTypes.STRING,
      field: 'user_id',
    },
    firstName: {
      type: DataTypes.STRING,
      field: 'first_name'
    },
    classUpdatedOn: {
      type: DataTypes.STRING,
      field: 'class_updated_on',
    },
    lastName: {
      type: DataTypes.STRING,
      field: 'last_name',
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
    username: {
      type: DataTypes.STRING,
      unique: true,
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
    }
  });

  User.associate = (models) => {
    User.belongsTo(models.Class);
  };

  return User;

};
