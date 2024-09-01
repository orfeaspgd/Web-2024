import {
    Users,
    Announcements,
    Products,
    Tasks,
    Categories,
    WarehouseProducts,
    Vehicles
} from '../schemas.js';

import { body, validationResult } from 'express-validator';

export default function announcementsRoutes(app) {
    //populate announcements table for citizen
    app.get('/citizen_announcements_table', async (req, res) => {
        try {
            const tasks = await Announcements.find()
                .populate('admin_id', 'name surname location username email role phone_number -_id')
                .populate('products', 'name quantity storage_quantity _id');
            res.json(tasks);
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
        const newAnnouncement = new Announcements({ admin_id: req.session.user._id, products: selectProduct});
        newAnnouncement.save()
            .then(() => res.json({ status: 'success', message: 'Announcement posted.' }))
            .catch((err) => {console.log(err);res.json({ status: 'error', message: 'Something went wrong.' })});
    });

}
