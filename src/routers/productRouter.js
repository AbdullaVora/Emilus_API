const express = require('express');
const { addProduct, updatedProduct, getProduct, deleteProduct } = require('../controllers/ProductControl');
const userAuth = require('../middleware/userMiddleware');
const router = express.Router();

router.post('/add-product', userAuth, addProduct);
router.get('/product-list', userAuth, getProduct)
router.put('/edit-product/:id', userAuth, updatedProduct);
router.delete('/delete-product/:id', userAuth, deleteProduct);


module.exports = router;