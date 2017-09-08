import Mongoose from 'mongoose';
import Bcrypt from 'bcrypt';

// Define user model, email must be unique
const UserSchema = new Mongoose.Schema({
  email: {
    type: String,
    index: { unique: true }
  },
  password: String,
  name: String,
  nextCaptcha: Date
});

// Function that compare a password with the hash created initially
UserSchema.methods.comparePassword = function comparePassword(password, callback) {
  Bcrypt.compare(password, this.password, callback);
};

// Function that runs before a user is saved, so that the password can be salted and hashed
UserSchema.pre('save', function saveHook(next) {
  const user = this;

  // proceed further only if the password is modified or the user is new
  if (!user.isModified('password')) return next();

  // Create salt
  return Bcrypt.genSalt((saltError, salt) => {
    if (saltError) { return next(saltError); }

    // Hash password
    return Bcrypt.hash(user.password, salt, (hashError, hash) => {
      if (hashError) { return next(hashError); }

      // replace the password string with hash value
      user.password = hash;

      return next();
    });
  });
});

export default Mongoose.model('User', UserSchema);