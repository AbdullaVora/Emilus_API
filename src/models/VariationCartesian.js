const mongoose = require('mongoose');

const cartesianSchema = new mongoose.Schema({
    parent: String,
    name: String,
    status: Boolean,
    updateAt: { type: Date, default: Date.now() },
    parentContainer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'parentContainer',
    },
    isParent: { type: Number, default: 0 }
})

const VarCartesianModel = mongoose.model('VariantsCartesian', cartesianSchema);
module.exports = { VarCartesianModel }