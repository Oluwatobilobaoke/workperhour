const JWT = require('jsonwebtoken');
const secret = process.env.CBA_ACCESS_TOKEN_SECRET;

module.exports = {
  signAccessToken: (data) => {
    const payload = data;
    const options = {
      expiresIn: process.env.CBA_ACCESS_TOKEN_SECRET_EXPIRES_IN,
      issuer: 'Mr Hosted Clown',
      audience: '',
    };
    const token = JWT.sign(payload, secret, options);
    return token;
  },
  verifyAccessToken: (token) => {
    const payload = JWT.verify(token, secret);
    // console.log(payload);
    return payload;
  },
};
