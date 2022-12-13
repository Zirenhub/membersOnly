const express = require('express');
const router = express.Router();

const roomController = require('../controllers/roomController');

router.use((req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.redirect('/log-in');
  }
});

router.post('/create', roomController.create_room);
router.get('/create', roomController.index);

router.post('/:id', roomController.post_message);
router.get('/:id', roomController.open_room);

module.exports = router;
