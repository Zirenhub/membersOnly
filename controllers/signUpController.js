const { body, validationResult } = require('express-validator');
const User = require('../models/user');

exports.index = (req, res) => res.render('sign-up-form');
exports.create_user = [
  body('firstName')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('First Name should not be empty'),
  body('lastName')
    .trim()
    .escape()
    .notEmpty()
    .withMessage('Last Name should not be empty'),
  body('email', 'Invalid Email').isEmail().trim().escape().normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password Must Be at Least 8 Characters')
    .trim()
    .escape(),
  body('confirmPassword')
    .isLength({ min: 8 })
    .withMessage('Confirm password Must Be at Least 8 Characters')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match with password');
      }
      return true;
    }),

  (req, res) => {
    const errors = validationResult(req);

    const body = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
    };

    if (!errors.isEmpty()) {
      res.render('sign-up-form', {
        ...body,
        errors: errors.array(),
      });
    } else {
      const user = new User({
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        password: body.password,
      }).save((err) => {
        if (err) {
          return res.send(err);
        }

        res.redirect('/');
      });
    }
  },
];
