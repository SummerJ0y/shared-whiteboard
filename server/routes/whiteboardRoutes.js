const express = require('express');
const router = express.Router();

const whiteboardController = require('../controllers/whiteboardController');

// Save and load whiteboard content
router.post('/save', whiteboardController.saveWhiteboard);
router.get('/load/:whiteboardId', whiteboardController.loadWhiteboard);

// Access control routes
router.get('/access/:whiteboardId', whiteboardController.getAccessInfo);
router.post('/invite', whiteboardController.inviteUser);
router.post('/visibility', whiteboardController.updateVisibility);
router.post('/updateRole', whiteboardController.updateUserRole);
router.post('/removeUser', whiteboardController.removeUser);

module.exports = router;