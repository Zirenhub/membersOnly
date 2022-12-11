const express = require('express');
const router = express.Router();

const signUpController = require('../controllers/signUpController');

router.post('/', signUpController.create_user);
router.get('/', signUpController.index);

module.exports = router;
