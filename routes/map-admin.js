import {
    Users,
    Announcements,
    Products,
    Tasks,
    Categories,
    WarehouseProducts,
    Vehicles
} from '../schemas.js';

export default function mapAdminRoutes(app) {
    // Get data for the map display
    app.get('/map-admin-data', async (req, res) => {
        try {
            // Fetch warehouse's location which is the location of the admin
            const warehouse = await Users.findOne({role: 'admin'}).select('location');

            // Fetch all vehicles and their data
            const vehicles = await Vehicles.find()
                .populate('rescuer_id', 'location')
                .populate('cargo.product_id', 'name')
                .populate('task_ids', 'type status');

            // Fetch all tasks (both requests and offers) and their data
            const tasks = await Tasks.find()
                .populate('citizen_id', 'name surname phone_number location')
                .populate('product_id', 'name')

            res.json({
                warehouse,
                vehicles,
                tasks
            });
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });

    // Update the location of the warehouse
    app.put('/update-warehouse-location', async (req, res) => {
        try {
            const { latitude, longitude } = req.body;

            await Users.findOneAndUpdate({role: 'admin'}, {
                location: {
                    latitude,
                    longitude
                }
            });

            res.json({
                message: 'Warehouse location updated successfully'
            });
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });
}