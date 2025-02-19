const express = require('express');
const userAuth = require('../middleware/userMiddleware');
const { addVariants, getvariants, updateVariants, deleteVariant, getParents } = require('../controllers/VariationCartesian');
const router = express.Router();

router.post("/add-variants", userAuth, addVariants);
router.get("/get-variants", userAuth, getvariants);
router.put("/update-variants/:id", userAuth, updateVariants);
router.delete("/delete-variant/:id", userAuth, deleteVariant);

module.exports = router;