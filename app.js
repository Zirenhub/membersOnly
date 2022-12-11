require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
// routes
const signUpRouter = require('./routes/signUp');
const logInRouter = require('./routes/logIn');
// models
const User = require('./models/user');

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
  new localStrategy((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: 'Incorrect username' });
      }
      if (user.password !== password) {
        return done(null, false, { message: 'Incorrect password' });
      }
      return done(null, user);
    });
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => res.render('index'));
app.use('/sign-up', signUpRouter);
app.use('/log-in', logInRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`app listening on port ${PORT}`));
