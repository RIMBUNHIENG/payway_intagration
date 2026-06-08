import jwt from 'jsonwebtoken';
import { User, UsersType } from '../models/index.js';

// JWT Secret (should be in .env)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.user_id,
            email: user.email,
            user_type_id: user.user_type_id
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

// Middleware to authenticate JWT token
const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'No token provided'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Get user from database with user type
        const user = await User.findByPk(decoded.id, {
            include: [{
                model: UsersType,
                as: 'userType'
            }]
        });

        if (!user || user.status !== 'active') {
            return res.status(401).json({
                error: 'Authentication failed',
                message: 'User not found or inactive'
            });
        }

        // Attach user to request
        req.user = user;
        req.userId = user.user_id;
        req.userType = user.userType?.user_type_name;

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Authentication failed',
                message: 'Invalid token'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Authentication failed',
                message: 'Token expired'
            });
        }

        console.error('Authentication error:', error);
        return res.status(500).json({
            error: 'Authentication error',
            message: 'Internal server error'
        });
    }
};

// Middleware to check user type/role
const authorize = (...allowedUserTypes) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'User not authenticated'
            });
        }

        if (!allowedUserTypes.includes(req.userType)) {
            return res.status(403).json({
                error: 'Access denied',
                message: `This action requires one of these user types: ${allowedUserTypes.join(', ')}`
            });
        }

        next();
    };
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findByPk(decoded.id, {
            include: [{
                model: UsersType,
                as: 'userType'
            }]
        });

        if (user && user.status === 'active') {
            req.user = user;
            req.userId = user.user_id;
            req.userType = user.userType?.user_type_name;
        }

        next();
    } catch (error) {
        // Silently fail for optional auth
        next();
    }
};

export {
    generateToken,
    authenticate,
    authorize,
    optionalAuth,
    JWT_SECRET,
    JWT_EXPIRES_IN
};
