const express = require('express');
const router = express.Router();
const controller = require('../controllers');

router.get('/', controller.getName);
router.use('/contacts', require('./contacts'));

module.exports = router;