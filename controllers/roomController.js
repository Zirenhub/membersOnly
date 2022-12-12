const { body, validationResult } = require('express-validator');
const Room = require('../models/room');

exports.index = (req, res) => res.render('create-room-form');
exports.create_room = [
  body('name')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Room Name should not be empty'),
  body('password').trim().escape(),

  (req, res) => {
    const errors = validationResult(req);

    const body = {
      name: req.body.name,
      password: req.body.password,
    };

    if (!errors.isEmpty()) {
      res.render('create-room-form', {
        ...body,
        errors: errors.array(),
      });
    } else {
      const room = new Room({
        name: body.name,
        password: body.password,
        creator: req.user._id,
      });

      room.save((err) => {
        if (err) {
          return res.send(err);
        }

        res.redirect(room.url);
      });
    }
  },
];
exports.open_room = async (req, res) => {
  const room = await Room.findById(req.params.id);

  res.render('room', { room: room });
};
