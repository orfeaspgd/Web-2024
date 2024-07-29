import express from "express";
import 'dotenv/config'
import session from 'express-session';
import { body, validationResult } from 'express-validator';
import {
    Users,
    Announcements,
    Products,
    Tasks,
    Categories
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

//login page
app.use(express.urlencoded({ extended: true }));
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, './frontend/login.html'));
});

app.use(session({
    secret: 'session_pass',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

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

//logout
app.post('/logout', async (req, res) => {
    req.session.destroy((err) => {
        if(err) {
            res.json({ status: 'error', message: 'Something went wrong.'});
        }
    })
    res.json({ status: 'success', redirectUrl: '/login' });
});

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

//test for joins in mongoose
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

app.get('/products', async (req, res) => {
    try {
        const products = await Products.find({}, 'name');
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

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
    newAnnouncement.save()
        .then(() => res.json({ status: 'success', message: 'Announcement posted.' }))
        .catch((err) => {console.log(err);res.json({ status: 'error', message: 'Something went wrong.' })});
});

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


//add products from json
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

