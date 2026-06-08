import { User, UsersType } from '../models/index.js';
import { generateToken } from '../middleware/auth.js';

class AuthController {
    // Register new user
    async register(req, res, next) {
        try {
            const { email, password, user_type_name = 'user' } = req.body;

            // Validation
            if (!email || !password) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: 'Email and password are required'
                });
            }

            if (password.length < 6) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: 'Password must be at least 6 characters'
                });
            }

            // Check if user exists
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({
                    error: 'Registration failed',
                    message: 'User with this email already exists'
                });
            }

            // Get user type
            const userType = await UsersType.findOne({
                where: { user_type_name }
            });

            if (!userType) {
                return res.status(400).json({
                    error: 'Registration failed',
                    message: 'Invalid user type'
                });
            }

            // Create user
            const user = await User.create({
                email,
                password, // Will be hashed by model hook
                user_type_id: userType.user_type_id,
                status: 'active'
            });

            // Generate token
            const token = generateToken(user);

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                token,
                user: user.toSafeObject()
            });
        } catch (error) {
            next(error);
        }
    }

    // Login user
    async login(req, res, next) {
        try {
            const { email, password } = req.body;

            // Validation
            if (!email || !password) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: 'Email and password are required'
                });
            }

            // Find user with user type
            const user = await User.findOne({
                where: { email },
                include: [{
                    model: UsersType,
                    as: 'userType',
                    attributes: ['user_type_name']
                }]
            });

            if (!user) {
                return res.status(401).json({
                    error: 'Login failed',
                    message: 'Invalid email or password'
                });
            }

            if (user.status !== 'active') {
                return res.status(401).json({
                    error: 'Login failed',
                    message: 'Account is inactive'
                });
            }

            // Check password
            const isPasswordValid = await user.comparePassword(password);

            if (!isPasswordValid) {
                return res.status(401).json({
                    error: 'Login failed',
                    message: 'Invalid email or password'
                });
            }

            // Update timestamps handled by Sequelize

            // Generate token
            const token = generateToken(user);

            res.json({
                success: true,
                message: 'Login successful',
                token,
                user: user.toSafeObject()
            });
        } catch (error) {
            next(error);
        }
    }

    // Get current user profile
    async getProfile(req, res, next) {
        try {
            const user = await User.findByPk(req.userId, {
                attributes: { exclude: ['password'] },
                include: [{
                    model: UsersType,
                    as: 'userType',
                    attributes: ['user_type_name']
                }]
            });

            if (!user) {
                return res.status(404).json({
                    error: 'User not found'
                });
            }

            res.json({
                success: true,
                user: user
            });
        } catch (error) {
            next(error);
        }
    }

    // Update user profile
    async updateProfile(req, res, next) {
        try {
            const { status } = req.body;

            const user = await User.findByPk(req.userId);

            if (!user) {
                return res.status(404).json({
                    error: 'User not found'
                });
            }

            const updateData = {};
            if (status) updateData.status = status;

            await user.update(updateData);

            res.json({
                success: true,
                message: 'Profile updated successfully',
                user: user.toSafeObject()
            });
        } catch (error) {
            next(error);
        }
    }

    // Change password
    async changePassword(req, res, next) {
        try {
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: 'Current password and new password are required'
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: 'New password must be at least 6 characters'
                });
            }

            const user = await User.findByPk(req.userId);

            if (!user) {
                return res.status(404).json({
                    error: 'User not found'
                });
            }

            // Verify current password
            const isPasswordValid = await user.comparePassword(currentPassword);

            if (!isPasswordValid) {
                return res.status(401).json({
                    error: 'Password change failed',
                    message: 'Current password is incorrect'
                });
            }

            // Update password (will be hashed by model hook)
            await user.update({ password: newPassword });

            res.json({
                success: true,
                message: 'Password changed successfully'
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new AuthController();
