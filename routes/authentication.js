import {
    Users,
    Announcements,
    Products,
    Tasks,
    Categories,
    WarehouseProducts,
    Vehicles
} from '../schemas.js';

const phoneRegex = /^\d{10}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;   //phone number and email regular expressions

export default function authenticationRoutes(app) {
    // Login page
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

    // Logout
    app.post('/logout', async (req, res) => {
        req.session.destroy((err) => {
            if(err) {
                res.json({ status: 'error', message: 'Something went wrong.'});
            }
        })
        res.json({ status: 'success', redirectUrl: '/login' });
    });

    // Create account for rescuer by admin in the admin's create rescuer page
    app.post('/admin_create_account', async (req, res) => {
        const { firstname, lastname, username, phone_number, email, password, vehicleName, latitude, longitude} = req.body;

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

        const existingVehicle = await Vehicles.findOne({ name: vehicleName });
        if (existingVehicle) {
            return res.json({ status: 'error', message: 'Vehicle name already exists.' });
        }

        // Create a new rescuer account with the given details
        const newUser = new Users({
            name: firstname,
            surname: lastname,
            username: username,
            phone_number: phone_number,
            email: email,
            password: password,
            role: "rescuer",
            location: {
                latitude: latitude,
                longitude: longitude
            }});

        // Save the new rescuer account
        await newUser.save();

        // Create a new vehicle for the rescuer
        const newVehicle = new Vehicles({
            name: vehicleName,
            rescuer_id: newUser._id,
            cargo: [],
            task_ids: []
        });

        // Save the new vehicle
        await newVehicle.save();

        // Respond with success
        res.json({ status: 'success', message: 'Rescuer Account and vehicle created successfully.' });
    });

    // Create account for citizen in the login page redirect to create account page
    app.post('/login_create_account', async (req, res) => {
        const { firstname, lastname, username, phone_number, email, password, latitude, longitude } = req.body;

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

        // Create a new citizen account with the given details
        const newUser = new Users({
            name: firstname,
            surname: lastname,
            username: username,
            phone_number: phone_number,
            email: email,
            password: password,
            role: "citizen",
            location: {
                latitude: latitude,
                longitude: longitude
            }});

        // Save the new citizen account
        await newUser.save();

        // Respond with success
        res.json({ status: 'success', message: 'Citizen account created successfully.' });
    });

    // Get the warehouse location for the map in the admin's create rescuer page and the citizen's create account page
    // This route is part of authentication because it is used in the create account pages
    app.get('/warehouse-location', async (req, res) => {
        try {
            // Fetch warehouse's location which is the location of the admin
            const warehouse = await Users.findOne({ role: 'admin' }).select('location');

            if (!warehouse || !warehouse.location) {
                return res.status(404).json({ message: 'Warehouse location not found' });
            }

            res.json(warehouse.location);
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });
}

