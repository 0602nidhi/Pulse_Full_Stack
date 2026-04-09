const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'pulse_video_super_secret_jwt_key', {
    expiresIn: '30d',
  });
};

module.exports = generateToken;
