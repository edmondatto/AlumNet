const { User } = require('../models');

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
        const newUser = await User.create({
          email,
          id: userRecord.uid
        });

        response.status(201).send({
          status: 201,
          msg: 'User registered successfully',
          user: {
            email: newUser.email,
            id: newUser.id,
            created_at: newUser.createdAt
          }
        });
      }
       catch (error) {
        return response.status(500).send({
          status: 500,
          msg: 'Internal server error'
        });
      }
    } else {
      return response.status(400).send({
        status: 400,
        msg: 'Email and password are both required'
      });
    }
  },

  async login(request, response) {
    const { email, password } = request.body;

    if (email && password) {
      try {
        const { user } = await firebase.auth().signInWithEmailAndPassword(email, password);
        const token = await user.getIdToken();

        return response.status(200).send({
          status: 200,
          msg: 'User logged in successfully',
          id: user.uid,
          email: user.email,
          token
        });
      } catch (error) {
        return response.status(400).send(error);
      }

    } else {
      return response.status(400).send({
        status: 400,
        msg: 'Email and password are both required'
      })
    }
  },

  admin,
};