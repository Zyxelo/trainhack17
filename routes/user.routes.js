import express from 'express';
import User from '../models/user.models';
import authCheckMiddleware from '../middleware/authenticate';
const STANDARD_DELAY = 30;  //Minutes

const router = new express.Router();

// Integer req.body.delay (optional) sets how much the delay until next captcha should be. 30 minutes standard
// REFACTOR: Delay should be queue specific parameter, not in api call. NOT ACTIVE RIGHT NOW! (2017-05-23)
router.put('/updateCaptcha', authCheckMiddleware)
router.put('/updateCaptcha', (req,res) => {
  let delay = STANDARD_DELAY;
  if (req.body.delay !== undefined) {
    delay = req.body.delay;
  }
  let time = new Date().getTime() + delay*60*1000;
  console.log(time);
  User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: { nextCaptcha: time } }
  ).then(() => {
    return res.json({ nextCaptcha: time});
  })
    .catch((err) => {
      return res.send(err);
    });
});

// Integer req.query.delay (optional) sets how much the delay until next captcha should be. 30 minutes standard
// REFACTOR: Delay should be queue specific parameter, not in api call. NOT ACTIVE RIGHT NOW! (2017-05-23)
router.get('/nextCaptcha', authCheckMiddleware)
router.get('/nextCaptcha', (req,res) => {
  let delay = STANDARD_DELAY;
  if (req.query.delay !== undefined) {
    delay = req.body.delay;
  }
  User.findById(req.user._id)
    .then((response) => {
      let time = new Date(response.nextCaptcha).getTime();
      return res.json({ nextCaptcha: time});
    })
    .catch((err) => {
      return res.send(err);
    });
});

// Router for retrieving the user info, user must be logged in and can only get its own info
router.get('/info', authCheckMiddleware);
router.get('/info', (req,res) => {
  User.findById(req.user._id)
    .then( (user) => {
      delete user.password; // The password is removed from the response
      delete user.nextCaptcha; // The captcha is removed from the response
      return res.json(user);
    })
    .catch( (err) => {
      return res.send(err);
    })

});

// Router for uppdating the user password, user must be logged in
router.put('/changePassword', authCheckMiddleware);
router.put('/changePassword', (req, res) => {

  // Validate password, must match and be at least 6 characters long
  if (req.body.password !== req.body.ctrlPassword || req.body.password.trim().length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Check form for errors',
      errors: 'Passwords must match and be at least 6 characters long'
    });
  }

  // If valid, user is found in the database, password is changed and user saved
  User.findById(req.user._id)
    .then( (user) => {
      user.password = req.body.password;
      user.save((err) => {
        if (err) {
          return res.send(err);
        }
        return res.json({ message: 'Password changed!' })
      });
    })
    .catch()
});
export default router;
