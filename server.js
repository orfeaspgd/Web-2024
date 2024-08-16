import express from "express";
import 'dotenv/config'
import session from 'express-session';
import { body, validationResult } from 'express-validator';
import {
    Users,
    Announcements,
    Products,
    Tasks,
    Categories,
    WarehouseProducts
} from './schemas.js';

const app = express();
const port = 3000;

import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const phoneRegex = /^\d{10}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;   //phone number and email regular expressions

app.use(express.static(path.join(__dirname, './frontend')));
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.use(express.json()); //parse json bodies

//MongoDb connection
import mongoose from 'mongoose';
import {ER_MAX_PREPARED_STMT_COUNT_REACHED} from "mysql/lib/protocol/constants/errors.js";
mongoose.connect(process.env.DB);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("We're connected to the database!");
});

//get login page html file
app.use(express.urlencoded({ extended: true }));
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, './frontend/login.html'));
});

//session details for login functionality
app.use(session({
    secret: 'session_pass',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

//login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await Users.findOne({ username: username, password: password })
    if (user) {
        req.session.user = user;
        res.json({ status: 'success', redirectUrl: '/home' });
    } else {
        res.json({ status: 'error', message: 'Invalid username or password.' });
    }
});

//home pages after login
app.get('/home', (req, res) => {
    if(req.session.user && req.session.user.role === 'admin'){
    res.sendFile(path.join(__dirname, './frontend/home_admin.html'));
    }
    else if (req.session.user && req.session.user.role === 'citizen') {
        res.sendFile(path.join(__dirname, './frontend/home_citizen.html'));
    }
    else if(req.session.user && req.session.user.role === 'rescuer'){
        res.sendFile(path.join(__dirname, './frontend/home_rescuer.html'));
    }else (res.redirect("/login"));

});

//warehouse management page for admin
app.get('/warehouse', (req, res) => {
    if(req.session.user && req.session.user.role === 'admin'){
        res.sendFile(path.join(__dirname, './frontend/admin_warehouse.html'));
    }else (res.redirect("/login"));
});

//logout
app.post('/logout', async (req, res) => {
    req.session.destroy((err) => {
        if(err) {
            res.json({ status: 'error', message: 'Something went wrong.'});
        }
    })
    res.json({ status: 'success', redirectUrl: '/login' });
});

//admin page create account
app.post('/admin_create_account', async (req, res) => {
    const { firstname, lastname, username, phone_number, email, password, role } = req.body;

    if (!phoneRegex.test(phone_number)) {
        return res.json({ status: 'error', message: 'Invalid phone number format.' });
    }
    if (!emailRegex.test(email)) {
        return res.json({ status: 'error', message: 'Invalid email format.' });
    }

    const existingUser = await Users.findOne({ username: username });
    if (existingUser) {
        return res.json({ status: 'error', message: 'Username already exists.' });
    }

    const existingPhoneNum = await Users.findOne({ phone_number: phone_number });
    if (existingPhoneNum) {
        return res.json({ status: 'error', message: 'Phone number is already being used.' });
    }

    const existingEmail = await Users.findOne({ email: email});
    if (existingEmail) {
        return res.json({ status: 'error', message: 'Email is already being used.' });
    }

    const newUser = new Users({ name: firstname, surname: lastname, username: username, phone_number: phone_number, email: email, password: password, role: role });
    newUser.save()
        .then(() => res.json({ status: 'success', message: 'Account created successfully.' }))
        .catch((err) => {console.log(err);res.json({ status: 'error', message: 'Something went wrong.' })});
});

//login page create account
app.post('/login_create_account', async (req, res) => {
    const { firstname, lastname, username, phone_number, email, password } = req.body;

    if (!phoneRegex.test(phone_number)) {
        return res.json({ status: 'error', message: 'Invalid phone number format.' });
    }
    if (!emailRegex.test(email)) {
        return res.json({ status: 'error', message: 'Invalid email format.' });
    }

    const existingUser = await Users.findOne({ username: username });
    if (existingUser) {
        return res.json({ status: 'error', message: 'Username already exists.' });
    }

    const existingPhoneNum = await Users.findOne({ phone_number: phone_number });
    if (existingPhoneNum) {
        return res.json({ status: 'error', message: 'Phone number is already being used.' });
    }

    const existingEmail = await Users.findOne({ email: email});
    if (existingEmail) {
        return res.json({ status: 'error', message: 'Email is already being used.' });
    }

    const newUser = new Users({ name: firstname, surname: lastname, username: username, phone_number: phone_number, email: email, password: password, role: "citizen" });
    newUser.save()
        .then(() => res.json({ status: 'success', message: 'Account created successfully.' }))
        .catch((err) => { console.log(err); res.json({ status: 'error', message: 'Something went wrong.' }) });
});

//populate task table for admin
app.get('/admin_tasks_table', async (req, res) => {
    try {
        const tasks = await Tasks.find()
            .populate('citizen_id', 'name surname location username email role phone_number -_id')
            .populate('rescuer_id', 'name surname location username email role phone_number -_id')
            .populate('product_id', 'name quantity storage_quantity -_id');
        res.json(tasks);
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

//populate announcements table for citizen
app.get('/citizen_announcements_table', async (req, res) => {
    try {
        const tasks = await Announcements.find()
            .populate('admin_id', 'name surname location username email role phone_number -_id')
            .populate('products', 'name quantity storage_quantity -_id');
        res.json(tasks);
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

//get all products
app.get('/products', async (req, res) => {
    try {
        const products = await Products.find({}, 'name');
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

//get product by id
app.get('/product/:id', async (req, res) => {
    try {
        const product = await Products.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

//get all categories
app.get('/categories', async (req, res) => {
    try {
        const categories = await Categories.find({}, 'category_name');
        res.json(categories);
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

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

//admin page create announcement
app.post('/admin_create_announcement', [
    body('selectProduct.*').trim().escape(),
    body('quantity.*').trim().escape().isNumeric().isInt({ min: 1 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'error', message: 'Invalid input.' });
    }

    const { selectProduct} = req.body;

    console.log(req.body)
    const newAnnouncement = new Announcements({ admin_id: req.session.user._id, products: selectProduct});
    console.log(req.session.user);
    newAnnouncement.save()
        .then(() => res.json({ status: 'success', message: 'Announcement posted.' }))
        .catch((err) => {console.log(err);res.json({ status: 'error', message: 'Something went wrong.' })});
});

//populate database with data from usidas
app.post('/pull_from_usidas', async (req, res) => {
    try{const usidasJson = await fetch("http://usidas.ceid.upatras.gr/web/2023/export.php")
    const result = await usidasJson.json()
    let newCategories = []
    for (let i = 0; i < result.categories.length; i++){
        if(await Categories.findOne({ category_name: result.categories[i].category_name }) === null){
            newCategories.push(result.categories[i])
        }
    }

    let newProducts = []
    for (let i = 0; i < result.items.length; i++){
        if(await Products.findOne({ id: result.items[i].id }) === null){
            newProducts.push(result.items[i])
        }
    }

    let products    = newProducts.map(current_product => { //replace category id with category name in products
        const product_category = result.categories.find(current_category => current_category.id.trim() === current_product.category.trim()) //find category of product
        current_product.category = product_category.category_name                                                  // replace category id with category name
        return current_product
    })
    let categories    = newCategories.map(current_product => { //remove id from categories
        delete current_product.id;
        return current_product
    })

    await Categories.insertMany(categories)
    let findCategories = await Categories.find({})
    await Products.insertMany(                                //replace category name with category mongo id in products
        products.map(current_product => {
            console.log(findCategories.length)
            current_product.category = findCategories.find(current_category => {console.log(current_category.category_name.trim(), current_product.category.trim());return current_category.category_name.trim() === current_product.category.trim()})._id //if === condition matches, get the mongo id of the category and replace it me to product category
            return current_product
        })
    )
       res.json({ status: 'success', message: 'Products added.' })
    }
    catch (err) {
        res.status(500).send(err);
        console.log(err);
        res.json({status: 'error', message: 'Something went wrong.'})
    }
});

//populate database with json file
app.post('/add_products_from_json', async (req, res) => {
    try{
        const result = JSON.parse(req.body.fileContents)
        let newCategories = []
        for (let i = 0; i < result.categories.length; i++){
            if(await Categories.findOne({ category_name: result.categories[i].category_name }) === null){
                newCategories.push(result.categories[i])
            }
        }

        let newProducts = []
        for (let i = 0; i < result.items.length; i++){
            if(await Products.findOne({ id: result.items[i].id }) === null){
                newProducts.push(result.items[i])
            }
        }

        let products    = newProducts.map(current_product => { //replace category id with category name in products
            const product_category = result.categories.find(current_category => current_category.id.trim() === current_product.category.trim()) //find category of product
            current_product.category = product_category.category_name                                                  // replace category id with category name
            return current_product
        })
        let categories    = newCategories.map(current_product => { //remove id from categories
            delete current_product.id;
            return current_product
        })

        Categories.insertMany(categories)
        let findCategories = await Categories.find({})
        Products.insertMany(                                //replace category name with category mongo id in products
            products.map(current_product => {
                current_product.category = findCategories.find(current_category => current_category.category_name.trim() === current_product.category.trim())._id //if === condition matches, get the mongo id of the category and replace it me to product category
                return current_product
            })
        )
        res.json({ status: 'success', message: 'Products added.' })
    }
    catch (err) {
        res.status(500).send(err);
        console.log(err);
        res.json({status: 'error', message: 'Something went wrong.'})
    }
});

//admin warehouse delete product
app.delete('/delete_product', async (req, res) => {
    try {
        const { _id } = req.body;
        await Products.deleteOne({ _id: _id });
        await Tasks.deleteMany({product_id: _id});
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

//admin warehouse create product
app.post('/create_product', async (req, res) => {
    const { productName, selectCategory, productDetailName, productDetailValue} = req.body;
    let productDetails = [];
    for (let i =0 ; i < productDetailName.length; i++){
        productDetails.push ({detail_name: productDetailName[i], detail_value: productDetailValue[i]})
    }
    console.log(productDetails);
    const newProduct = new Products({ name: productName, category: selectCategory, details: productDetails });
    newProduct.save()
        .then(() => res.json({ status: 'success', message: 'Product created.' }))
        .catch((err) => {console.log(err);res.json({ status: 'error', message: 'Something went wrong.' })});
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

app.put('/edit_product_warehouse', async (req, res) => {
    const { selectEditProductWarehouse, warehouseEditQuantity } = req.body;
    try {
        const findone = await WarehouseProducts.findOneAndUpdate(
            { _id: selectEditProductWarehouse },
            { quantity: warehouseEditQuantity},
            { new: true }
        );
        console.log(findone);
        res.json({ status: 'success', message: 'Product Updates.' });
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ status: 'error', message: 'Something went wrong.' });
    }
});
