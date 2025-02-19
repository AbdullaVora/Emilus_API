const express = require('express');
const { register, login, signOut } = require('../controllers/User');
const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/signOut', signOut);

module.exports = router;    