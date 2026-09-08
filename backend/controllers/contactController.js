const Contact = require('../models/contactModel');

// Submit contact form (public endpoint)
const submitContact = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Create new contact submission
        const newContact = new Contact({
            name,
            email,
            subject,
            message
        });

        await newContact.save();

        res.status(201).json({
            success: true,
            message: 'Your message has been sent successfully! We will get back to you soon.',
            contactId: newContact._id
        });

    } catch (error) {
        console.error('Error submitting contact form:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.'
        });
    }
};

// Get all contact submissions (admin only)
const getAllContacts = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;
        
        // Build filter object
        const filter = {};
        if (status && status !== 'All') {
            filter.status = status.toUpperCase();
        }
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } },
                { message: { $regex: search, $options: 'i' } }
            ];
        }

        // Calculate pagination
        const skip = (page - 1) * limit;
        
        // Get contacts with pagination
        const contacts = await Contact.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const total = await Contact.countDocuments(filter);

        res.json({
            success: true,
            contacts,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalContacts: total,
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching contact submissions'
        });
    }
};

// Get single contact by ID (admin only)
const getContactById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const contact = await Contact.findById(id);
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact submission not found'
            });
        }

        res.json({
            success: true,
            contact
        });

    } catch (error) {
        console.error('Error fetching contact:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching contact submission'
        });
    }
};

// Update contact status (admin only)
const updateContactStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes, isResolved } = req.body;

        const updateData = {};
        if (status) updateData.status = status;
        if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
        if (isResolved !== undefined) {
            updateData.isResolved = isResolved;
            if (isResolved) {
                updateData.resolvedAt = new Date();
                updateData.resolvedBy = req.admin._id; // From auth middleware
            } else {
                updateData.resolvedAt = null;
                updateData.resolvedBy = null;
            }
        }

        const contact = await Contact.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact submission not found'
            });
        }

        res.json({
            success: true,
            message: 'Contact status updated successfully',
            contact
        });

    } catch (error) {
        console.error('Error updating contact status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating contact status'
        });
    }
};

// Delete contact (admin only)
const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;
        
        const contact = await Contact.findByIdAndDelete(id);
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact submission not found'
            });
        }

        res.json({
            success: true,
            message: 'Contact submission deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting contact submission'
        });
    }
};

// Get contact statistics (admin only)
const getContactStats = async (req, res) => {
    try {
        const stats = await Contact.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const total = await Contact.countDocuments();
        const newCount = await Contact.countDocuments({ status: 'NEW' });
        const resolvedCount = await Contact.countDocuments({ isResolved: true });

        res.json({
            success: true,
            stats: {
                total,
                new: newCount,
                resolved: resolvedCount,
                breakdown: stats
            }
        });

    } catch (error) {
        console.error('Error fetching contact stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching contact statistics'
        });
    }
};

module.exports = {
    submitContact,
    getAllContacts,
    getContactById,
    updateContactStatus,
    deleteContact,
    getContactStats
};
