const joi = require('joi');

const productValidateSchema = joi.object({
    title: joi.string().min(5).max(255),
    description: joi.string().min(10).max(1000),
    price: joi.number().min(1),
    images: joi.array().max(10),
    thumbnail: joi.string(),
    // stock: joi.number().integer(),
    cost: joi.number().integer(),
    category: joi.string(),
    tags: joi.array().items(joi.string()),
    width: joi.number(),
    height: joi.number(),
    weight: joi.number(),
    shippingFees: joi.number().integer(),
    taxRate: joi.number().integer(),
    code: joi.string(),
    // varCode: joi.string(),
    // color: joi.string(),
    variations: joi.array(),
    widthUnit: joi.string(),
    heightUnit: joi.string(),
    weightUnit: joi.string(),

    // variants: joi.object({}).items(joi.string())
})

const userValidateSchema = joi.object({
    name: joi.string(),
    email: joi.string().email().required(),
    password: joi.string().min(8).required(),
    // mobile: joi.number().integer(),
    // gender: joi.string().min(1),
    // addressLine1: joi.string(),
    // addressLine2: joi.string(),
    // city: joi.string(),
    // state: joi.string(),
    // country: joi.string(),
    // pincode: joi.number().integer()
})

const VarCartesianSchema = joi.object({
    parent: joi.string(),
    name: joi.string(),
    status: joi.boolean(),
    key: joi.number().integer(),
    date: joi.date()
})

module.exports = {
    productValidateSchema,
    userValidateSchema,
    VarCartesianSchema
}      