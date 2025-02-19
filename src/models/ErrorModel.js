const mongoose = require('mongoose');

const ErrorModel = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    module: {
        type: String,
        required: true
    },
    createAt: {
        type: Date,
        default: Date.now()
    },
})
const errorModel = mongoose.model('errorModel', ErrorModel);

module.exports = errorModel;