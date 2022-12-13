const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const RoomSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
});

RoomSchema.pre('save', function (next) {
  const room = this;

  if ((this.isModified('password') || this.isNew) && this.password) {
    bcrypt.genSalt(10, function (saltError, salt) {
      if (saltError) {
        return next(saltError);
      } else {
        bcrypt.hash(room.password, salt, function (hashError, hash) {
          if (hashError) {
            return next(hashError);
          }

          room.password = hash;
          next();
        });
      }
    });
  } else {
    return next();
  }
});

RoomSchema.virtual('url').get(function () {
  return `/room/${this._id}`;
});

module.exports = mongoose.model('Room', RoomSchema);
