const express = require('express');
const router = express.Router();

const whiteboardController = require('../controllers/whiteboardController');

// Save whiteboard content
router.post('/save', whiteboardController.saveWhiteboard);

// Load whiteboard content
router.get('/load/:whiteboardId', whiteboardController.loadWhiteboard);

module.exports = router;