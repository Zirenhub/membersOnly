require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
// routes
const signUpRouter = require('./routes/signUp');
const logInRouter = require('./routes/logIn');
const roomRouter = require('./routes/room');
// models
const User = require('./models/user');
const Room = require('./models/room');

const mongoDb = process.env.MONGODB_URL;
mongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongo connection error'));

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return done(null, false, { message: "Account doesn't exist" });
        }
        bcrypt.compare(password, user.password, (err, res) => {
          if (res) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Incorrect password' });
          }
        });
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.get('/log-out', (req, res) => {
  req.logout((err) => {
    if (err) {
      next(err);
    }

    res.redirect('/');
  });
});

app.get('/', async (req, res) => {
  let rooms = await Room.aggregate([
    {
      $project: {
        name: 1,
        members: 1,
        password: 1,
        length: { $size: '$members' },
      },
    },

    {
      $sort: { length: -1 },
    },

    {
      $addFields: {
        password: {
          $cond: {
            if: {
              $eq: [
                {
                  $ifNull: ['$password', ''],
                },
                '',
              ],
            },
            then: false,
            else: true,
          },
        },
      },
    },

    {
      $project: {
        name: 1,
        members: 1,
        password: 1,
      },
    },
  ]);

  // get back virtuals
  rooms = rooms.map((room) => Room.hydrate(room));

  res.render('index', { user: req.user, rooms: rooms });
});
app.use('/sign-up', signUpRouter);
app.use('/log-in', logInRouter);
app.use('/room', roomRouter);
app.use('/my-rooms', async (req, res) => {
  if (req.user) {
    const rooms = await Room.find({ creator: req.user._id });

    res.render('index', { user: req.user, rooms: rooms });
  } else {
    res.redirect('/');
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`app listening on port ${PORT}`));
