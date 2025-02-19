const { number } = require('joi');
const mongoose = require('mongoose');

const UserModel = new mongoose.Schema({
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    name: {
        type: String,
        // required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        // required: true
    },
    gender: {
        type: String,
        // required: true
    },
    password: {
        type: String,
        required: true
    },
    addressLine1: {
        type: String,
        // required: true
    },
    addressLine2: {
        type: String,
        // required: true
    },
    city: {
        type: String,
        // required: true
    },
    state: {
        type: String,
        // required: true
    },
    country: {
        type: String,
        // required: true
    },
    pincode: {
        type: String,
        // required: true
    },
    UserToken: {
        type: Array,
    }
});

const UserToken = new mongoose.Schema({
    token: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
})

const userModel = mongoose.model('User', UserModel);
const userToken = mongoose.model('UserToken', UserToken);

module.exports = { userModel, userToken };
