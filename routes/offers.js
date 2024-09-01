import {
    Announcements,
    Offers,
} from '../schemas.js';

import { body, validationResult } from 'express-validator';

export default function announcementsRoutes(app) {
    //populate offers table for citizen
    app.get('/citizen_offers_table', async (req, res) => {
        try {
            const tasks = await Offers.find()
                .populate('products', 'name quantity storage_quantity -_id');
            res.json(tasks);
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });

    //citizen page create announcement
    app.post('/citizen_create_offer', [
        body('announcement').trim().escape(),
    ], async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ status: 'error', message: 'Invalid input.' });
        }
        const { announcement } = req.body;
        const { products } = await Announcements.findById(announcement);
        const newOffer = new Offers({ citizen_id: req.session.user._id, products });
        newOffer.save()
            .then(() => res.json({ status: 'success', message: 'Offer posted.' }))
            .catch((err) => {console.log(err);res.json({ status: 'error', message: 'Something went wrong.' })});
    });

    app.put('/citizen_cancel_offer', [
        body('offer').trim().escape(),
    ], async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ status: 'error', message: 'Invalid input.' });
        }
        const { offer } = req.body;
        Offers.updateOne(
            { _id: offer },
            { status: 'cancelled' }
        ).then(() => res.json({ status: 'success', message: 'Offer cancelled.' }))
            .catch((err) => {console.log(err);res.json({ status: 'error', message: 'Something went wrong.' })});
    });

}
