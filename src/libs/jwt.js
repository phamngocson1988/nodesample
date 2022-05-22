import jwt from 'jsonwebtoken';
import { systemConfig } from '@/core/config';
/**
 * Get user if valid token, error if invalid.
 *
 * @param {string} token
 */
const decode = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, systemConfig.JWT_SECRET, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded);
    });
  });
};

const generateJWT = (user) => {
  const today = new Date();
  const exp = new Date(today);
  exp.setDate(today.getDate() + 360);
  return jwt.sign(
    {
      ...user,
      exp: Math.floor(exp.getTime() / 1000)
    },
    systemConfig.JWT_SECRET
  );
};

export { decode, generateJWT };
