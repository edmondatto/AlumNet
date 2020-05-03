const { admin } = require('../controllers/auth');

const storageBucket = admin.storage().bucket();
const uploadToken = Math.ceil(Math.random() * 1000000000000);
const uploadOptions = {
  gzip: true,
  resumable: false,
  public: true,
  metadata: {
    metadata :{
      firebaseStorageDownloadTokens:  uploadToken,
    }
  },
};

module.exports = async function uploadFileToCloud (filePath) {
  try {
    await storageBucket.upload(filePath, uploadOptions);
    return `https://firebasestorage.googleapis.com/v0/b/${process.env.FIREBASE_STORAGE_BUCKET}/o/${filePath.split('/').pop()}?alt=media&token=${uploadToken}`
  } catch (error) {
    return error
  }
};