import {
    Users,
    Announcements,
    Products,
    Tasks,
    Categories,
    WarehouseProducts
} from '../schemas.js';

export default function warehouseRoutes(app) {
    //get warehouse products
    app.get('/warehouse_products', async (req, res) => {
        try {
            const warehouse = await WarehouseProducts.find();
            const products = await Products.find({ _id: { $in: warehouse.map(warehouseProduct => warehouseProduct.product_id) } });
            const warehouseData = products.map(product => {
                let current_warehouse = warehouse.find(warehouse => warehouse.product_id.equals(product._id));
                return {...product._doc, warehouseId: current_warehouse._id, warehouseQuantity: current_warehouse.quantity}; //creates copu of "product", instead of acting like a pointer
            })
            res.json(warehouseData);
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });
    //admin warehouse delete product
    app.delete('/delete_product', async (req, res) => {
        try {
            const { _id } = req.body;
            await Products.deleteOne({ _id: _id });
            await Tasks.deleteMany({product_id: _id});
            await WarehouseProducts.deleteMany({product_id: _id});
            const announcements = await Announcements.find({ products: { $elemMatch: { $eq: _id} }});
            for (const announcement of announcements) {
                if (announcement.products.length === 1) {
                    await Announcements.deleteOne({ _id: announcement._id });
                } else {
                    await Announcements.updateOne(
                        { _id: announcement._id },
                        { $pull: { products: _id } }
                    );
                }
            }
            res.json({ status: 'success', message: 'Product deleted.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ status: 'error', message: 'Something went wrong.' });
        }
    });

    //admin warehouse delete category
    app.delete('/delete_category', async (req, res) => {
        try {
            const {_id} = req.body;
            await Categories.deleteOne({_id: _id});
            const productsToDelete = await Products.find({category: _id});
            await Products.deleteMany({category: _id});
            const productIdsToDelete = productsToDelete.map(product => product._id);
            const announcements = await Announcements.find({products: {$elemMatch: {$in: productIdsToDelete}}});
            await Tasks.deleteMany({product_id: {$in: productIdsToDelete}});
            await WarehouseProducts.deleteMany({product_id: {$in: productIdsToDelete}});
            for(const IdToDelete of productIdsToDelete)
            {
                for (const announcement of announcements) {
                    await Announcements.updateMany(
                        {_id: announcement._id},
                        {$pull: {products: IdToDelete}}
                    );
                }
            }
            await Announcements.deleteMany({products: []});
            res.json({ status: 'success', message: 'Category deleted.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ status: 'error', message: 'Something went wrong.' });
        }
    });

    // admin warehouse create product
    app.post('/create_product', async (req, res) => {
        const { productName, selectCategory, productDetailName, productDetailValue } = req.body;
        let productDetails = [];

        // Check if productDetailName and productDetailValue are provided
        if (productDetailName && productDetailValue) {
            if (Array.isArray(productDetailName) && Array.isArray(productDetailValue)) {
                // Handle the case when multiple details are provided
                for (let i = 0; i < productDetailName.length; i++) {
                    productDetails.push({
                        detail_name: productDetailName[i],
                        detail_value: productDetailValue[i]
                    });
                }
            } else {
                // Handle the case when a single detail is provided (non-array)
                productDetails.push({
                    detail_name: productDetailName,
                    detail_value: productDetailValue
                });
            }
        } else {
            // If no details are provided, add a default detail with empty strings
            productDetails.push({
                detail_name: "",
                detail_value: ""
            });
        }

        // Create and save the new product
        const newProduct = new Products({ name: productName, category: selectCategory, details: productDetails });
        newProduct.save()
            .then(() => res.json({ status: 'success', message: 'Product created.' }))
            .catch((err) => {
                console.log(err);
                res.json({ status: 'error', message: 'Something went wrong.' });
            });
    });

    //admin warehouse create category
    app.post('/create_category', async (req, res) => {
        const { categoryName} = req.body;
        const existingCategory = await Categories.findOne({ category_name: categoryName });
        if (existingCategory) {
            return res.json({ status: 'error', message: 'Category already exists.' });
        }
        const newCategory = new Categories({ category_name: categoryName});
        newCategory.save()
            .then(() => res.json({ status: 'success', message: 'Category created.' }))
            .catch((err) => {console.log(err);res.json({ status: 'error', message: 'Something went wrong.' })});
    });
    //admin warehouse edit product
    app.put('/edit_product', async (req, res) => {
        const { selectEditProduct, editProductName, selectCategoryEditProduct, editProductDetailName, editProductDetailValue } = req.body;

        const updateData = {
            name: editProductName,
            category: selectCategoryEditProduct,
            details: editProductDetailName.map((name, index) => ({
                detail_name: name,
                detail_value: editProductDetailValue[index]
            }))
        };

        try {
            const product = await Products.findOneAndUpdate(
                { _id: selectEditProduct },
                updateData,
                { new: true }
            );
            if (!product) {
                return res.status(404).json({ status: 'error', message: 'Product not found' });
            }
            res.json({ status: 'success', message: 'Product updated successfully.' });
        } catch (err) {
            console.error('Error updating product:', err);
            res.status(500).json({ status: 'error', message: 'Something went wrong.' });
        }
    });

    //add product or add to the quantity in warehouse
    app.post('/add_product_warehouse', async (req, res) => {
        const { selectAddProductWarehouse, warehouseQuantity } = req.body;
        try {
            const existingProduct = await WarehouseProducts.findOne({ product_id: selectAddProductWarehouse});
            if (existingProduct) {

                existingProduct.quantity = parseInt(existingProduct.quantity, 10);
                const warehouseQuantityInt = parseInt(warehouseQuantity, 10);
                existingProduct.quantity += warehouseQuantityInt;
                await WarehouseProducts.findOneAndUpdate(
                    { product_id: selectAddProductWarehouse },
                    { quantity: existingProduct.quantity },
                    { new: true }
                );
                res.json({status: 'success', message: 'Product quantity updated in Warehouse.'});
            }
            else {
                const newWarehouseProduct = new WarehouseProducts({ product_id: selectAddProductWarehouse, quantity: warehouseQuantity });
                await newWarehouseProduct.save();
                res.json({ status: 'success', message: 'Product added to Warehouse.' });
            }
        } catch (err) {
            console.error('Error updating product:', err);
            res.status(500).json({ status: 'error', message: 'Something went wrong.' });
        }
    });
    //change quantity of product in warehouse
    app.put('/edit_product_warehouse', async (req, res) => {
        const { selectEditProductWarehouse, warehouseEditQuantity } = req.body;
        try {
            const findone = await WarehouseProducts.findOneAndUpdate(
                { _id: selectEditProductWarehouse },
                { quantity: warehouseEditQuantity},
                { new: true }
            );
            res.json({ status: 'success', message: 'Product Updates.' });
        } catch (err) {
            console.error('Error updating product:', err);
            res.status(500).json({ status: 'error', message: 'Something went wrong.' });
        }
    });
}