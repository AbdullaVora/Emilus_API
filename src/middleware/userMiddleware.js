const { userToken } = require("../models/UserModel");

const userAuth = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Get the token from the Authorization header

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    try {
        // Find the user by token and populate the user field
        const tokenData = await userToken.findOne({ token }).populate('user');

        if (!tokenData) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        req.user = tokenData.user; // Attach user object to request
        req.userId = tokenData.user._id; // Attach user ID for further use
        
        next(); // Proceed to the next middleware
    } catch (error) {
        console.error('Error during authentication:', error); // Log error for debugging
        res.status(500).json({ message: 'Internal server error', error });
    }
};

module.exports = userAuth;
