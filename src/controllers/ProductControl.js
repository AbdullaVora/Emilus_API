const multer = require('multer');
const fs = require('fs');
const path = require('path');
const errorModel = require("../models/ErrorModel");
const { productModel, categoryModel, variantModel, tagModel, shippingModel } = require("../models/ProductModel");
const { productValidateSchema } = require('../middleware/validateInput');

// =========================================== CRUD Operation ================================================

const addProduct = async (req, res) => {
    try {
        const { error } = productValidateSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { title, description, price, height, heightUnit, width, widthUnit, weight, weightUnit, shippingFees, taxRate, cost, code, category, tags, variations } = req.body;

        const uniqName = await productModel.findOne({ title: title });
        if (uniqName) {
            return res.status(400).json({ message: "Name is already in the product" });
        }

        const images = req.files?.images
            ? req.files.images.map(file => `/uploads/product/${file.name}`)
            : req.body.images || [];

        const thumbnail = req.files?.thumbnail?.[0]
            ? `/uploads/product/${req.files.thumbnail[0].name}`
            : req.body.thumbnail || null;

        // Create the product
        const newProduct = await productModel.create({
            title,
            description,
            price,
            taxRate,
            cost,
            code,
            images,
            thumbnail
        });

        // Step 2: Create Variations if provided
        let variationIds = [];
        if (Array.isArray(variations) && variations.length > 0) {
            const formattedData = variations.map(({ key, price, stock, ...attributes }) => ({
                id: key.toString(),
                data: Object.entries(attributes).map(([label, value]) => ({
                    label,
                    value,
                    _id: undefined // Remove _id
                })),
                price,
                stock,
                product: newProduct._id // Add product ID
            }));

            const createdVariations = await variantModel.create({ variants: formattedData });
            variationIds = createdVariations._id;
        }

        // Step 3: Create Tags if provided
        let tagIds = [];
        if (tags || thumbnail) {
            const createdTagDoc = await tagModel.create({
                tags: tags,
                thumbnail: thumbnail,
                product: newProduct._id
            });
            tagIds = createdTagDoc._id;
        }

        // Step 4: Create Category if provided
        let categoryId = null;
        if (category || thumbnail) {
            const createdCategory = await categoryModel.create({
                name: category,
                thumbnail: thumbnail,
                product: newProduct._id
            });
            categoryId = createdCategory._id;
        }

        // Step 5: Create Shipping
        let shippingId = null;
        const shippingDetail = await shippingModel.create({
            width: `${width} ${widthUnit}`,
            height: `${height} ${heightUnit}`,
            weight: `${weight} ${weightUnit}`,
            shippingFees,
            product: newProduct._id
        });
        shippingId = shippingDetail._id;

        // Step 6: Update product with relations
        const updatedProduct = await productModel.findByIdAndUpdate(
            newProduct._id,
            {
                variations: variationIds,
                tags: tagIds,
                category: categoryId,
                shipping: shippingId
            },
            { new: true }
        );

        // let uploads;
        const thumbnailPath = path.resolve(__dirname, "../../uploads/thumbnail");
        const imagesPath = path.resolve(__dirname, "../../uploads/products");

        // Ensure both directories exist
        if (!fs.existsSync(thumbnailPath)) {
            fs.mkdirSync(thumbnailPath, { recursive: true });
        }
        if (!fs.existsSync(imagesPath)) {
            fs.mkdirSync(imagesPath, { recursive: true });
        }

        // If storing a single thumbnail
        if (thumbnail) {
            let base64Data = thumbnail.replace(/^data:image\/\w+;base64,/, ""); // Remove prefix
            let imageBuffer = Buffer.from(base64Data, "base64"); // Convert to buffer

            let fileName = `thumbnail_${Date.now()}.png`;
            let filePath = path.join(thumbnailPath, fileName); // Save in thumbnail folder

            fs.writeFile(filePath, imageBuffer, (err) => {
                if (err) {
                    return res.status(500).json({ message: "Failed to upload thumbnail" });
                }
                // console.log("Thumbnail saved:", fileName);
            });
        }

        // If storing multiple images
        if (images && Array.isArray(images)) {
            images.forEach((imageBase64, index) => {
                let base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, ""); // Remove prefix
                let imageBuffer = Buffer.from(base64Data, "base64"); // Convert to buffer

                let fileName = `image_${Date.now()}_${index}.png`;
                let filePath = path.join(imagesPath, fileName); // Save in products folder

                fs.writeFile(filePath, imageBuffer, (err) => {
                    if (err) {
                        console.error(`Failed to upload image ${index}`, err);
                    } else {
                        console.log(`Image ${index} saved:`, fileName);
                    }
                });
            });
        }


        res.status(201).json({
            message: "Product added successfully",
            product: updatedProduct
        });

    } catch (error) {
        await errorModel.create({
            message: error.message,
            details: error.stack,
            module: "Add Product"
        });
        res.status(500).json({ message: error.message });
    }
};

const getProduct = async (req, res) => {
    try {
        const products = await productModel.find()
            .populate([{ path: "category" }, { path: "tags" }, { path: "variations" }, { path: "shipping" }]);
        // console.log(products);

        res.status(200).json(products);
    } catch (error) {
        await errorModel.create({
            message: error.message,
            details: error.stack,
            module: "Product List"
        });
        res.status(500).json({ message: error.message });
    }
};


const updatedProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Product ID is required" });
        }

        // Find the existing product
        const product = await productModel.findById(id).populate("category tags variations shipping");
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const {
            title, description, price, height, heightUnit, width, widthUnit,
            weight, weightUnit, shippingFees, taxRate, code, cost, category, tags, variations, images, thumbnail
        } = req.body;

        // ========================== Update Variations ==========================
        if (Array.isArray(variations) && variations.length > 0) {
            const formattedData = variations.map(({ key, price, stock, ...attributes }) => ({
                id: key.toString(),
                data: Object.entries(attributes).map(([label, value]) => ({
                    label,
                    value,
                    _id: undefined // Remove _id
                })),
                price,
                stock,
                product: product._id
            }));
        
            await variantModel.updateMany(
                { _id: product.variations[0]._id },
                { $set: { variants: formattedData } }
            );
        }
        

        // ========================== Update Category ==========================
        let updatedCategoryId = product.category?._id;
        if (category && category !== product.category.name) {
            // Update category if provided and different from the existing one
            updatedCategoryId = await categoryModel.findByIdAndUpdate(
                product.category._id,
                { name: category, thumbnail: thumbnail || product.category.thumbnail },
                { new: true }
            )
        }

        // ========================== Update Tags ==========================
        let updatedTagIds = product.tags?.map(tag => tag._id);
        if (tags && tags.length > 0) {
            // Update tags if provided and different from the existing ones
            updatedTagIds = await tagModel.findByIdAndUpdate(
                product.tags[0]._id,
                { tags: tags, thumbnail: thumbnail || product.tags.thumbnail },
                { new: true }
            )
        }

        // ========================== Update Shipping ==========================
        let updatedShippingId = product.shipping?._id;
        if (product.shipping?._id) {
            updatedShippingId = await shippingModel.findByIdAndUpdate(product.shipping._id, {
                shippingFees: shippingFees || product.shipping.shippingFees,
                width: width ? `${width} ${widthUnit}` : product.shipping.width,
                height: height ? `${height} ${heightUnit}` : product.shipping.height,
                weight: weight ? `${weight} ${weightUnit}` : product.shipping.weight
            }, { new: true })
        }

        // ========================== Update Product ==========================
        const updatedProductData = await productModel.findByIdAndUpdate(
            id,
            {
                title,
                description,
                taxRate,
                cost,
                code,
                price,
                thumbnail,
                images,
            },
            { new: true }
        );

        res.status(200).json({ message: "Product updated successfully", product: updatedProductData });

    } catch (error) {
        await errorModel.create({
            message: error.message,
            details: error.stack,
            module: "Update Product"
        });

        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await productModel.findByIdAndUpdate(id, { isDeleted: 1 });
        // console.log(product);


        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // const tagId = product.tags._id
        //     ; const categoryId = product.category._id;
        // const variantId = product.variations._id;
        // const shippingId = product.shipping._id;

        // // Delete associated images
        // if (product.images && product.images.length > 0) {
        //     // Delete all product images
        //     product.images.forEach(imagePath => {
        //         const fullImagePath = path.join(__dirname, '..', imagePath); // Full path of the image

        //         if (fs.existsSync(fullImagePath)) {
        //             fs.unlinkSync(fullImagePath);  // Delete the file
        //         }
        //     });
        // }

        // // Delete thumbnail image if it exists
        // if (product.thumbnail) {
        //     const fullThumbnailPath = path.join(__dirname, '..', product.thumbnail); // Full path of the thumbnail
        //     console.log(fullThumbnailPath);
        //     if (fs.existsSync(fullThumbnailPath)) {
        //         fs.unlinkSync(fullThumbnailPath);  // Delete the file
        //     }
        // }

        // // Now delete the product
        // await productModel.findByIdAndDelete(id);
        // await tagModel.findByIdAndDelete(tagId);
        // await categoryModel.findByIdAndDelete(categoryId);
        // await variantModel.findByIdAndDelete(variantId);
        // await shippingModel.findByIdAndDelete(shippingId);

        res.status(200).json({ message: "Product deleted successfully" });

    } catch (error) {
        await errorModel.create({
            message: error.message,
            details: error.stack,
            module: "Delete Product"
        });
        res.status(500).json({ message: error.message });
    }
};


// =========================================== Multer Storage ================================================

const createStorage = () => {
    return multer.diskStorage({
        destination: (req, file, cb) => {
            let folder;
            if (file.fieldname === 'thumbnail') {
                folder = 'uploads/thumbnail'; // Folder for thumbnails
            } else {
                folder = 'uploads/product'; // Folder for product images
            }

            // Create the directory if it doesn't exist
            fs.mkdir(folder, { recursive: true }, (err) => {
                if (err) {
                    return cb(new Error('Failed to create directory'), null);
                }
                cb(null, folder);
            });
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const extension = path.extname(file.originalname);
            const filename = file.fieldname + '-' + uniqueSuffix + extension;
            cb(null, filename);
        }
    });
};


// File filter to validate image types
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'), false);
    }
};

// Create a single multer instance that handles both images and thumbnail
const upload = multer({
    storage: createStorage('product'),
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
}).fields([
    { name: 'images', maxCount: 10 },
    { name: 'thumbnail', maxCount: 1 }
]);

// Wrapper function to handle multer errors
const handleUpload = (req, res, next) => {
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                message: 'Upload error',
                error: err.message
            });
        } else if (err) {
            return res.status(500).json({
                message: 'Server error',
                error: err.message
            });
        }
        // If everything is fine, proceed
        next();
    });
};


module.exports = { addProduct, getProduct, updatedProduct, deleteProduct };

