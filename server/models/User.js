const mongoose = require('mongoose');

const UserDocumentAccessSchema = new mongoose.Schema({
  whiteboardId: String,
  role: { type: String, enum: ['owner', 'editor', 'read-only'], default: 'read-only' }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  documents: [UserDocumentAccessSchema]
});

module.exports = mongoose.model('User', UserSchema);