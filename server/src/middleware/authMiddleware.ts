import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
  userEmail?: string;
  userName?: string;
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  
  const token = authHeader.slice(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'campusconnectsecret') as { 
      id: string; 
      role: string;
      email: string;
      name: string;
    };
    
    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.userEmail = decoded.email;
    req.userName = decoded.name;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Admin only middleware
export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.userRole !== 'admin') {
    res.status(403).json({ message: 'Admin access required' });
    return;
  }
  next();
};








