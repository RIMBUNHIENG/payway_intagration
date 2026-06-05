import { User  } from '../models/index.js';
import stripe from '../config/stripe.js';
import { generateToken  } from '../middleware/auth.js';

class AuthController {
    // Register new user
    async register(req, res, next) {
        try {
            const { email, password, name } = req.body;

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

            // Create Stripe customer
            const stripeCustomer = await stripe.customers.create({
                email: email,
                name: name,
                metadata: { source: 'registration' }
            });

            // Create user
            const user = await User.create({
                email,
                password, // Will be hashed by model hook
                name,
                stripeCustomerId: stripeCustomer.id,
                role: 'user'
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

            // Find user
            const user = await User.findOne({ where: { email } });

            if (!user) {
                return res.status(401).json({
                    error: 'Login failed',
                    message: 'Invalid email or password'
                });
            }

            if (!user.isActive) {
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

            // Update last login
            await user.update({ lastLogin: new Date() });

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
                attributes: { exclude: ['password'] }
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
            const { name, metadata } = req.body;

            const user = await User.findByPk(req.userId);

            if (!user) {
                return res.status(404).json({
                    error: 'User not found'
                });
            }

            const updateData = {};
            if (name) updateData.name = name;
            if (metadata) updateData.metadata = { ...user.metadata, ...metadata };

            await user.update(updateData);

            // Update Stripe customer
            if (user.stripeCustomerId) {
                await stripe.customers.update(user.stripeCustomerId, {
                    name: user.name,
                    metadata: user.metadata
                });
            }

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
