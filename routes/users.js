const express = require('express');
const { Op } = require('sequelize');
const router = express.Router();
const User = require('../models/user.model');

// GET all users with pagination and search
router.get('/', async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const offset = (page - 1) * limit;
        
        const whereClause = search ? {
            [Op.or]: [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ]
        } : {};

        const { count, rows: users } = await User.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: users,
            pagination: {
                total: count,
                page: parseInt(page),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        next(error);
    }
});

// GET a single user by ID
router.get('/:id', async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
});

// CREATE a new user
router.post('/', async (req, res, next) => {
    const transaction = await User.sequelize.transaction();
    
    try {
        const { name, email } = req.body;
        
        // Check if user with email already exists
        const existingUser = await User.findOne({ 
            where: { email },
            transaction 
        });
        
        if (existingUser) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Email already in use'
            });
        }
        
        const user = await User.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            status: 'active'
        }, { transaction });
        
        await transaction.commit();
        
        res.status(201).json({
            success: true,
            data: user
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
});

// UPDATE a user
router.put('/:id', async (req, res, next) => {
    const transaction = await User.sequelize.transaction();
    
    try {
        const { name, email, status } = req.body;
        const user = await User.findByPk(req.params.id, { transaction });
        
        if (!user) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Check if email is being updated and if it's already in use
        if (email && email !== user.email) {
            const emailExists = await User.findOne({
                where: { 
                    email,
                    id: { [Op.ne]: user.id }
                },
                transaction
            });
            
            if (emailExists) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Email already in use by another user'
                });
            }
        }
        
        // Update user fields
        if (name) user.name = name.trim();
        if (email) user.email = email.trim().toLowerCase();
        if (status) user.status = status;
        
        await user.save({ transaction });
        await transaction.commit();
        
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
});

// DELETE a user
router.delete('/:id', async (req, res, next) => {
    const transaction = await User.sequelize.transaction();
    
    try {
        const userId = req.params.id;
        console.log(`Attempting to delete user with ID: ${userId}`);
        
        const user = await User.findByPk(userId, { transaction });
        
        if (!user) {
            console.log(`User not found with ID: ${userId}`);
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        console.log(`Deleting user:`, user.toJSON());
        await user.destroy({ transaction });
        await transaction.commit();
        
        console.log(`Successfully deleted user with ID: ${userId}`);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting user:', error);
        await transaction.rollback();
        
        // Send more detailed error response
        res.status(500).json({
            success: false,
            message: 'Failed to delete user',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;
