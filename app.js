const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
require('dotenv').config();

const mongoDb = process.env.MONGODB_URL;
mongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection();
db.on('error', console.error.bind(console, 'mongo connection error'));
