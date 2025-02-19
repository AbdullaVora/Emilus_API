const { VarCartesianSchema } = require("../middleware/validateInput");
const errorModel = require("../models/ErrorModel");
const { VarCartesianModel, parentContainerModel } = require('../models/VariationCartesian')

const addVariants = async (req, res) => {
    try {
        const {parent, name, status } = req.body;
        console.log(req.body);

        const { error } = VarCartesianSchema.validate({ parent, name, status });

        if (error) {
            console.log(error.details);
            return res.status(400).json({ message: error.details[0].message });
        }

        // if (parent === 'N/A') {
        //     // const response = await parentContainerModel.create({ parentName: name })
        // }

        const response = await VarCartesianModel.create({
            parent, name, status, isParent: parent === 'N/A' ? 1 : 0
        })


        res.status(201).json(response);

    } catch (error) {
        await errorModel.create({
            message: error.message,
            details: error.stack,
            module: "Add Product Variation Cartesian",
        })
        res.status(500).json({ message: error.message });
    }
}

const getvariants = async (req, res) => {
    try {
        const response = await VarCartesianModel.find()
        res.status(200).json(response);
    } catch (error) {
        await errorModel.create({
            message: error.message,
            details: error.stack,
            module: "Get Product Variations",
        })
        res.status(500).json({ message: error.message });
    }
}

const deleteVariant = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await VarCartesianModel.findByIdAndDelete(id);

        if (!response) {
            return res.status(404).json({ message: "Variant not found" });
        }

        res.status(200).json({ message: "Variant deleted", id });
    } catch (error) {
        await errorModel.create({
            message: error.message,
            details: error.stack,
            module: "Delete Product Variation",
        });
        res.status(500).json({ message: error.message });
    }
};

const updateVariants = async (req, res) => {
    try {
        const { id } = req.params;
        const { parent, name, status } = req.body;

        // Log the request body for debugging
        console.log("Request Body:", req.body);

        // Validate the input
        const { error } = VarCartesianSchema.validate({ parent, name });

        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        // Prepare the update object
        const updateData = {
            parent,
            name,
            status, // Default to true if status is not provided
        };

        // Log the update query for debugging
        console.log("Update Query:", updateData);

        // Update the variant
        const response = await VarCartesianModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        // Log the updated document for debugging
        console.log("Updated Document:", response);

        if (!response) {
            return res.status(404).json({ message: "Variant not found" });
        }

        res.status(200).json(response);
    } catch (error) {
        await errorModel.create({
            message: error.message,
            details: error.stack,
            module: "Update Product Variation",
        });
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addVariants, getvariants, deleteVariant, updateVariants }