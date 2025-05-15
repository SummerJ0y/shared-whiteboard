const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

// Get the history docs of the user
router.get('/docs', userController.getHistoryDocs);

module.exports = router;