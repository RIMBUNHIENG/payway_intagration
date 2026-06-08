import { Mentor } from '../models/index.js';
import { Op } from 'sequelize';

class MentorController {
    // Create mentor profile
    async createMentor(req, res, next) {
        try {
            const {
                firstname,
                lastname,
                gender,
                phone_number,
                address,
                description,
                profile_picture
            } = req.body;

            // Validation
            if (!firstname || !lastname) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: 'First name and last name are required'
                });
            }

            // Create mentor profile
            const mentor = await Mentor.create({
                firstname,
                lastname,
                gender,
                phone_number,
                address,
                description,
                profile_picture
            });

            res.status(201).json({
                success: true,
                message: 'Mentor profile created successfully',
                mentor
            });
        } catch (error) {
            next(error);
        }
    }

    // List all mentors
    async listMentors(req, res, next) {
        try {
            const { search, gender } = req.query;

            const where = {};

            // Add search filter
            if (search) {
                where[Op.or] = [
                    { firstname: { [Op.iLike]: `%${search}%` } },
                    { lastname: { [Op.iLike]: `%${search}%` } },
                    { description: { [Op.iLike]: `%${search}%` } }
                ];
            }

            // Add gender filter
            if (gender) {
                where.gender = gender;
            }

            const mentors = await Mentor.findAll({
                where,
                order: [['create_date', 'DESC']]
            });

            res.json({
                success: true,
                mentors
            });
        } catch (error) {
            next(error);
        }
    }

    // Get single mentor
    async getMentor(req, res, next) {
        try {
            const { id } = req.params;

            const mentor = await Mentor.findByPk(id);

            if (!mentor) {
                return res.status(404).json({
                    error: 'Mentor not found'
                });
            }

            res.json({
                success: true,
                mentor
            });
        } catch (error) {
            next(error);
        }
    }

    // Update mentor profile
    async updateMentor(req, res, next) {
        try {
            const { id } = req.params;
            const {
                firstname,
                lastname,
                gender,
                phone_number,
                address,
                description,
                profile_picture
            } = req.body;

            const mentor = await Mentor.findByPk(id);

            if (!mentor) {
                return res.status(404).json({
                    error: 'Mentor not found'
                });
            }

            const updateData = {};
            if (firstname) updateData.firstname = firstname;
            if (lastname) updateData.lastname = lastname;
            if (gender) updateData.gender = gender;
            if (phone_number) updateData.phone_number = phone_number;
            if (address) updateData.address = address;
            if (description !== undefined) updateData.description = description;
            if (profile_picture) updateData.profile_picture = profile_picture;

            await mentor.update(updateData);

            res.json({
                success: true,
                message: 'Mentor profile updated successfully',
                mentor
            });
        } catch (error) {
            next(error);
        }
    }

    // Delete mentor profile
    async deleteMentor(req, res, next) {
        try {
            const { id } = req.params;

            const mentor = await Mentor.findByPk(id);

            if (!mentor) {
                return res.status(404).json({
                    error: 'Mentor not found'
                });
            }

            await mentor.destroy();

            res.json({
                success: true,
                message: 'Mentor profile deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    // Get mentor statistics
    async getMentorStats(req, res, next) {
        try {
            const totalMentors = await Mentor.count();

            const mentorsByGender = await Mentor.findAll({
                attributes: [
                    'gender',
                    [sequelize.fn('COUNT', sequelize.col('gender')), 'count']
                ],
                group: ['gender'],
                raw: true
            });

            res.json({
                success: true,
                stats: {
                    total: totalMentors,
                    by_gender: mentorsByGender
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new MentorController();