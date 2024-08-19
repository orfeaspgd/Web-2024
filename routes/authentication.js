import {
    Users,
    Announcements,
    Products,
    Tasks,
    Categories,
    WarehouseProducts
} from '../schemas.js';

const phoneRegex = /^\d{10}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;   //phone number and email regular expressions

export default function authenticationRoutes(app) {
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


}

