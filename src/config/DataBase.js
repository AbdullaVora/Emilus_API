const mongoose = require('mongoose');
require('dotenv').config();

const DataBase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Database connected');
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = DataBase;