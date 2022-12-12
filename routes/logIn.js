const express = require('express');
const router = express.Router();

const logInController = require('../controllers/logInController');

router.post('/', logInController.log_user);
router.get('/', logInController.index);

module.exports = router;
