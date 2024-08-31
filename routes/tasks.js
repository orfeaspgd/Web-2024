import {
    Users,
    Announcements,
    Products,
    Tasks,
    Categories,
    WarehouseProducts,
    Vehicles
} from '../schemas.js';

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
}