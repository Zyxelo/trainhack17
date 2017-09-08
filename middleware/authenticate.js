import User from '../models/user.models';
import config from '../config';
import jwt from 'jsonwebtoken';

// Middleware for controlling that a valid JSON Web Token is sent with the request
// Add the user to the request so that the user info can be retrieved
export default (req, res, next) => {

  // Send not authorized if a jwt is not sent
  if (!req.headers.authorization) {
    return res.status(401).end();
  }

  // Get the last part from a authorization header string like "bearer token-value"
  const token = req.headers.authorization.split(' ')[1];

  // Decode the token using the secret key-phrase specificed in config
  return jwt.verify(token, config.jwtSecret, (err, decoded) => {

    // If any errors, send a response with the error
    if (err) { return res.status(401).end(); }

    // Get the user
    const userEmail = decoded.sub;
    return User.findOne({ email: userEmail }, (userErr, user) => {
      if (userErr || !user) {
        // If any errors, send a response with the error
        return res.status(401).end();
      }
      // If a user is found, the token is valid and the request can be served. The user is added to the request
      req.user = user;
      return next();
    });
  });
};
