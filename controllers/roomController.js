const { body, validationResult } = require('express-validator');
const Room = require('../models/room');
const Message = require('../models/message');

exports.index = (req, res) => res.render('create-room-form');
exports.create_room = [
  body('name')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Room Name should not be empty'),
  body('password').trim().escape(),

  (req, res, next) => {
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

      room.members.push(req.user._id);

      room.save((err) => {
        if (err) {
          return next(err);
        }

        res.redirect(room.url);
      });
    }
  },
];
exports.open_room = async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (room) {
    const messages = await Message.find({ roomId: room._id }).populate(
      'author',
      'firstName lastName'
    );

    if (!room.members.includes(req.user._id)) {
      room.members.push(req.user._id);
      room.save((err) => {
        if (err) {
          return next(err);
        }
      });
    }

    res.render('room', { room: room, messages: messages });
  }
};
exports.post_message = [
  body('message')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Message should not be empty'),

  async (req, res, next) => {
    const errors = validationResult(req);
    const room = await Room.findById(req.params.id);

    if (!errors.isEmpty()) {
      res.render('room', {
        room: room,
        errors: errors.array(),
      });
    } else {
      const message = new Message({
        roomId: req.params.id,
        author: req.user._id,
        content: req.body.message,
      });

      message.save((err) => {
        if (err) {
          return next(err);
        }

        res.redirect(room.url);
      });
    }
  },
];
exports.leave_room = async (req, res, next) => {
  Room.findByIdAndUpdate(
    { _id: req.params.id },
    { $pull: { members: req.user._id } },
    (err, result) => {
      if (err) {
        return next(err);
      }
      return res.redirect('/');
    }
  );
};
exports.delete_room = async (req, res) => {
  const room = await Room.findById(req.params.id);

  if (room) {
    if (room.creator.toString() === req.user._id.toString()) {
      await Message.deleteMany({ roomId: req.params.id });
      await room.deleteOne();
      return res.redirect('/');
    }
    res.send("You can't delete this project.");
  }
};
