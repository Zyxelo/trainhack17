import express from 'express';
const passport = require('passport');

const router = new express.Router();

// Validate signupform
function validateSignupForm(payload) {
  const errors = {};
  let isFormValid = true;
  let message = '';

  // Check if email is entered
  if (!payload || typeof payload.email !== 'string' ) {
    isFormValid = false;
    errors.email = 'Please provide a correct email address.';
  }

  // Check if password is entered and at least 6 characters long
  if (!payload || typeof payload.password !== 'string' || payload.password.trim().length < 6) {
    isFormValid = false;
    errors.password = 'Password must have at least 6 characters.';
  }

  // Check if name is entered
  if (!payload || typeof payload.name !== 'string' || payload.name.trim().length === 0) {
    isFormValid = false;
    errors.name = 'Please provide your name.';
  }

  // If something is not entered correclty add a message
  if (!isFormValid) {
    message = 'Check the form for errors.';
  }

  // Return the message and errors
  return {
    success: isFormValid,
    message,
    errors
  };
}

// Validate login
function validateLoginForm(payload) {
  const errors = {};
  let isFormValid = true;
  let message = '';

  // Check if email is entered
  if (!payload || typeof payload.email !== 'string' || payload.email.trim().length === 0) {
    isFormValid = false;
    errors.email = 'Please provide your email address.';
  }

  // Check if password is entered
  if (!payload || typeof payload.password !== 'string' || payload.password.trim().length === 0) {
    isFormValid = false;
    errors.password = 'Please provide your password.';
  }

  // If something is not entered correclty add a message
  if (!isFormValid) {
    message = 'Check the form for errors.';
  }

  // Return the message and errors
  return {
    success: isFormValid,
    message,
    errors
  };
}

// Route for signup
// Requires email, password and name uses passport to create the user
router.post('/signup', (req, res, next) => {

  // Validate form
  const validationResult = validateSignupForm(req.body);
  // Send response if not valid
  if (!validationResult.success) {
    return res.status(400).json({
      success: false,
      message: validationResult.message,
      errors: validationResult.errors
    });
  }

  // Create user with a passport strategy
  return passport.authenticate('local-signup', (err) => {

    //Check for errors
    if (err) {
      // 11000 Mongo code is for a duplication email error
      if (err.name === 'MongoError' && err.code === 11000) {
        // the 409 HTTP status code is for conflict error
        return res.status(409).json({
          success: false,
          message: 'Check the form for errors.',
          errors: {
            email: 'This email is already taken.'
          }
        });
      }

      // Send general error
      return res.status(400).json({
        success: false,
        message: 'Could not process the form.'
      });
    }

    // If succesfull, send response
    return res.status(200).json({
      success: true,
      message: 'You have successfully signed up! Now you should be able to log in.'
    });
  })(req, res, next);
});

// Router for login
// Requires email & password and uses passport to sign in the user
// Sens back a JSON Web Token to the user, which can be used to authenticate the user
router.post('/login', (req, res, next) => {
  // Validate form
  const validationResult = validateLoginForm(req.body);
  // Send response if not valid
  if (!validationResult.success) {
    return res.status(400).json({
      success: false,
      message: validationResult.message,
      errors: validationResult.errors
    });
  }

  // Login user with a passport strategy
  return passport.authenticate('local-login', (err, token, userData) => {

    //Check for errors
    if (err) {
      // If no user was loged in send error
      if (err.name === 'IncorrectCredentialsError') {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      // send general error
      return res.status(400).json({
        success: false,
        message: 'Could not process the form.'
      });
    }

    // If success, a valid token has been created which is sent in the response
    return res.json({
      success: true,
      message: 'You have successfully logged in!',
      token: token,
      user: userData
    });
  })(req, res, next);
});

export default router;