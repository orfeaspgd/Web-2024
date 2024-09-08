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

import productsRoutes from "./routes/products.js";
import warehouseRoutes from "./routes/warehouse-routes.js"
import importRoutes from "./routes/import.js";
import categoriesRoutes from "./routes/categories.js";
import announcementsRoutes from "./routes/announcements.js";
import tasksRoutes from "./routes/tasks.js";
import authenticationRoutes from "./routes/authentication.js";
import pagesRoutes from "./routes/pages.js";
import mapAdminRoutes from "./routes/map-admin.js";
import mapRescuerRoutes from "./routes/map-rescuer.js";
import cargoManagementRoutes from "./routes/cargo-management.js";
import taskManagementRoutes from "./routes/task-management.js";

const app = express();
const port = 3000;

import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.join(__dirname, './frontend')));
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

import NodeCache from 'node-cache';
const cache = new NodeCache();

// Serve static files from the 'node_modules' directory
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

app.use(express.json()); //parse json bodies

//MongoDb connection
import mongoose from 'mongoose';

mongoose.connect(process.env.DB);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("We're connected to the database!");
});

//get login page html file
app.use(express.urlencoded({ extended: true }));
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, './frontend/html/login.html'));
});

//session details for login functionality
app.use(session({
    secret: 'session_pass',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

productsRoutes(app);
warehouseRoutes(app, cache);
importRoutes(app);
categoriesRoutes(app, cache);
announcementsRoutes(app);
tasksRoutes(app);
authenticationRoutes(app);
pagesRoutes(app);
mapAdminRoutes(app);
mapRescuerRoutes(app);
cargoManagementRoutes(app);
taskManagementRoutes(app);