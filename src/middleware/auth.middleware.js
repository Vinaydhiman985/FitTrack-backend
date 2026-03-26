import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const JWT_SECRET = 'fittrack_super_secret_key_2024';

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Not authorized, no token' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.userId).select('-password');
    if (!req.user) {
      return res.status(401).json({ error: 'Not authorized, user missing' });
    }
    next();
  } catch (error) {
    res.status(401).json({ error: 'Not authorized, invalid token' });
  }
};

export default protect;
