const mongoose = require('mongoose');

const AccessSchema = new mongoose.Schema({
  email: String,
  role: { type: String, enum: ['owner', 'editor', 'read-only'], default: 'read-only' }
}, { _id: false });

const StrokeSchema = new mongoose.Schema({
  id: String,
  color: String,
  size: Number,
  points: [[Number]] // 2D array of [x, y]
}, { _id: false });

const TextBoxSchema = new mongoose.Schema({
  id: String,
  x: Number,
  y: Number,
  value: String
}, { _id: false });

const DocumentSchema = new mongoose.Schema({
  whiteboardId: { type: String, required: true, unique: true },
  title: String,
  createdBy: String,
  editorHTML: String, // <-- store Tiptap HTML
  strokes: [StrokeSchema], // <-- store drawing data
  textBoxes: [TextBoxSchema], // <-- store canvas text boxes
  access: {
    visibility: { type: String, enum: ['public', 'restricted'], default: 'restricted' },
    users: [AccessSchema]
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', DocumentSchema);