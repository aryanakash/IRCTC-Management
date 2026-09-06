const db = require('../db');

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const [rows] = await db.promise().query(
            `SELECT id, name, email, created_at 
             FROM users 
             WHERE id = ? AND is_deleted = 0`,
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        // Remove sensitive information before sending
        const profile = rows[0];
        delete profile.password;

        res.json(profile);
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ message: "Error fetching profile" });
    }
};
