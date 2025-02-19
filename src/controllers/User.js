const errorModel = require("../models/ErrorModel");
const { userModel, userToken } = require("../models/UserModel");
const CryptoJS = require("crypto-js");
const bcrypt = require("bcrypt");
const { userValidateSchema } = require("../middleware/validateInput");

const register = async (req, res) => {
    try {

        const { role, name, email, mobile, gender, password, addressLine1, addressLine2, city, state, country, pincode } = req.body;
        console.log(req.body);

        const { error } = userValidateSchema.validate(req.body);

        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        // Generate a secure token
        const UserToken = CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);

        // Check if password exists
        if (!password) {
            return res.status(400).json({ message: "Password is required" });
        }

        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const response = await userModel.create({
            role, name, email, mobile, gender, password: hashedPassword, addressLine1, addressLine2, city, state, country, pincode
        });

        if (!response) {
            return res.status(400).json({ message: "User Registration Failed" });
        }

        // Store token linked to the user
        await userToken.create({ token: UserToken, user: response._id });

        await userModel.findByIdAndUpdate(response._id, {
            UserToken: response._id
        })

        res.status(200).json({ message: "User Registered Successfully", data: response, token: UserToken });
    } catch (error) {
        await errorModel.create({
            message: error.message,
            details: error.stack,
            module: "User Register"
        });
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
};


const login = async (req, res) => {
    try {
        console.log(req.body);
        const { email, password } = req.body;

        const { error } = userValidateSchema.validate(req.body);

        if (error) {
            console.log(error.details[0].message);
            return res.status(400).json({ message: error.details[0].message });
            
        }

        // Find user by email
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid Email or Password" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid Email or Password" });
        }

        let existingToken = await userToken.findOne({ user: user._id });

        if (!existingToken) {
            const UserToken = CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);
            existingToken = await userToken.create({ token: UserToken, user: user._id });
        }

        res.status(200).json({ message: "User Logged in Successfully", data: user, token: existingToken.token });
    } catch (error) {
        await errorModel.create({
            message: error.message,
            details: error.stack,
            module: "User Login"
        });
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
};

const signOut = async (req, res) => {
    try {
        console.log(req.body);
        const { token } = req.body; // Extract token properly

        if (!token) {
            return res.status(400).json({ message: "Token is required for sign-out" });
        }

        const response = await userToken.findOne({ token });
        if (!response) {
            return res.status(404).json({ message: "User Token not found" });
        }

        await userToken.findByIdAndDelete(response._id);
        res.status(200).json({ message: "User Logged out successfully" });
    } catch (error) {
        await errorModel.create({
            message: error.message,
            details: error.stack,
            module: "User Logout"
        });
        res.status(500).json({ message: error.message });
    }
};


module.exports = { register, login, signOut };
