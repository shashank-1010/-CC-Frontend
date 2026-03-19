import { Response, NextFunction } from 'express';
import { protect, AuthRequest } from './authMiddleware';

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  protect(req, res, () => {
    if (req.userRole !== 'admin') {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }
    next();
  });
};
