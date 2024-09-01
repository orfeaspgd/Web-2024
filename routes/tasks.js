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

export default function tasksRoutes(app) {
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

    //populate offers table for citizen
    app.get('/citizen_offers_table', async (req, res) => {
        try {
            const offers = await Tasks.find()
                .populate('product_id', 'name quantity storage_quantity -_id');
            res.json(offers);
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });

    //citizen page create announcement
    app.post('/citizen_create_tasks', [
        body('products[]').trim().escape(),
        body('productQuantities[]').trim().escape(),
        body('type').trim().escape(),
    ], async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ status: 'error', message: 'Invalid input.' });
        }
        const { products, type, productQuantities } = req.body;
        console.log('----products----', products)

        Tasks.insertMany(
            products
                .filter((_product, index) => productQuantities[index] > 0)
                .map((product, index) => {
                    return {
                        citizen_id: req.session.user._id,
                        product_id: product,
                        quantity: productQuantities[index],
                        type: type
                    }
                })
        ).then(() => res.json({ status: 'success', message: 'Task posted.' }))
            .catch((err) => {console.log(err);res.json({ status: 'error', message: 'Something went wrong.' })});
    });

    app.put('/citizen_cancel_task', [
        body('task').trim().escape(),
    ], async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ status: 'error', message: 'Invalid input.' });
        }
        const { task } = req.body;
        Tasks.updateOne(
            { _id: task },
            { status: 'cancelled' }
        ).then(() => res.json({ status: 'success', message: 'task cancelled.' }))
            .catch((err) => {console.log(err);res.json({ status: 'error', message: 'Something went wrong.' })});
    });

}
