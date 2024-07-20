import express from "express";
import 'dotenv/config'
import session from 'express-session';
import {
    Users,
    AdminAnnouncements,
    Products,
    Tasks
} from './schemas.js';

const app = express();
const port = 3000;

import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.join(__dirname, '.')));
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

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
    res.sendFile(path.join(__dirname, './html files/login.html'));
});

app.use(session({
    secret: 'session_pass',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await Users.findOne({ username: username, password: password });
    if (user) {
        req.session.user = user;
        res.json({ status: 'success', redirectUrl: '/home' });
    } else {
        res.json({ status: 'error', message: 'Invalid username or password.' });
    }
});

//home pages after login
app.get('/home', (req, res) => {
    if(req.session.user && req.session.user.user_type === 'admin'){
    res.sendFile(path.join(__dirname, './html files/home_admin.html'));
    }
    else if (req.session.user && req.session.user.user_type === 'citizen') {
        res.sendFile(path.join(__dirname, './html files/home_citizen.html'));
    }
    else if(req.session.user && req.session.user.user_type === 'rescuer'){
        res.sendFile(path.join(__dirname, './html files/home_rescuer.html'));
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

app.post('/create_account', async (req, res) => {
    const { firstname, lastname, username, phone_number, email, password, role } = req.body;
    const newUser = new Users({ name: firstname, surname: lastname, username: username, phone_number: phone_number, email: email, password: password, user_type: role });
    newUser.save()
        .then(() => res.json({ status: 'success', message: 'Account created successfully.' }))
        .catch(() => res.json({ status: 'error', message: 'Something went wrong.' }));
});

//test for joins in mongoose
app.get('/admin_tasks_table', async (req, res) => {
    try {
        const tasks = await Tasks.find()
            .populate('citizen_id', 'name surname username email user_type phone_number -_id')
            .populate('rescuer_id', 'name surname username email user_type phone_number -_id')
            .populate('product_id', 'name description quantity storage_quantity -_id');
        console.log(tasks);
        res.json(tasks);
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

