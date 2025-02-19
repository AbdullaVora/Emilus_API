const mongoose = require("mongoose");

// Product Schema
const productSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    cost: Number,
    taxRate: Number,
    code: String,
    createAt: { type: Date, default: Date.now },
    updateAt: { type: Date },
    images: [String],
    thumbnail: String,

    // Corrected References
    variations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Variant" }],
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    shipping: { type: mongoose.Schema.Types.ObjectId, ref: "Shipping" },  // Corrected reference

    isDeleted: { type: Number, enum: [0, 1], default: 0 }
});

// Variant Schema
const variantSchema = new mongoose.Schema({
    // variantName: String,
    // price: Number,
    // stock: Number,
    // varCode: String,
    // color: String,
    // size: String,
    // material: String,
    // fabric: String,
    variants: [{
        id: { type: String },
        data: [{
            label: { type: String },
            value: { type: String },
            _id: false
        }],
        _id: false,
        price: { type: Number },
        stock: { type: Number },
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }
    }],
});

// Tag Schema
const tagSchema = new mongoose.Schema({
    tags: [String],
    description: String,
    thumbnail: String,
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }  // Corrected reference
});

// Category Schema
const categorySchema = new mongoose.Schema({
    name: String,
    thumbnail: String,
    description: String,
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }
});

const shippingSchema = new mongoose.Schema({
    weight: String,
    width: String,
    height: String,
    shippingFees: Number,
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }
})

// Register Models with Correct Names
const productModel = mongoose.model("Product", productSchema);
const variantModel = mongoose.model("Variant", variantSchema);
const tagModel = mongoose.model("Tag", tagSchema);
const categoryModel = mongoose.model("Category", categorySchema);
const shippingModel = mongoose.model("Shipping", shippingSchema);

module.exports = { productModel, variantModel, tagModel, categoryModel, shippingModel };
