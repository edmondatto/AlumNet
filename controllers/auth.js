const User = require('../models').User;

// Firebase Imports and Config
const firebase = require('firebase');
require('firebase/auth');
const { firebaseConfig }  = require('../config');
const admin = require('firebase-admin');
const serviceAccount = require('../ServiceAccountKey.json');

// Initialise firebase services
admin.initializeApp({credential: admin.credential.cert(serviceAccount)});
firebase.initializeApp(firebaseConfig);

module.exports = {
  async registerUser(request, response) {
    const { email, password } = request.body;
    console.log(request.body);

    if (email && password) {
      let userRecord;

      try {
        userRecord = await admin.auth().createUser({
          email,
          password
        });
      }
      catch (error) {
        return response.status(400).send(error)
      }

      try {
        await User.create({
          email,
          authId: userRecord.uid
        });

        response.status(200).send({
          status: 200,
          msg: 'User registered successfully',
          user: {
            email: userRecord.email
          }
        });
      }
       catch (error) {
        return response.status(500).send({
          status: 500,
          msg: 'Internal server error'
        })
      }
    } else {
      return response.status(400).send({
        status: 400,
        msg: 'Email and password are both required'
      })
    }
  },
};