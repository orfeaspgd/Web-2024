import {
    Users,
    Announcements,
    Products,
    Tasks,
    Categories,
    WarehouseProducts,
    Vehicles
} from '../schemas.js';

export default function taskManagementRoutes(app) {
    // Helper function to calculate the distance between two points using the Haversine formula (in meters)
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // metres
        const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // in metres
    }

    // View Tasks Assigned to Rescuer (Vehicle)
    app.get('/view-rescuer-tasks', async (req, res) => {
        // Check if user is logged in
        if (!req.session.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        // Access the rescuer ID from the session user object
        const rescuerId = req.session.user._id;

        try {
            // Find the vehicle that belongs to the rescuer
            const vehicle = await Vehicles.findOne({ rescuer_id: rescuerId })
                .populate({
                    path: 'task_ids',
                    populate: [
                        { path: 'citizen_id', select: 'name surname phone_number' },
                        { path: 'product_id', select: 'name details' }
                    ]
                });

            // Check if vehicle was found
            if (!vehicle) {
                return res.status(404).json({ message: 'Vehicle not found for the rescuer.' });
            }

            // Map the tasks to extract the required information
            const tasks = vehicle.task_ids.map(task => ({
                task_id: task._id,
                citizen_name: task.citizen_id.name,
                citizen_surname: task.citizen_id.surname,
                citizen_phone: task.citizen_id.phone_number,
                date_created: task.createdAt,
                type: task.type,
                quantity: task.quantity,
                product_name: task.product_id.name
            }));

            res.json(tasks);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    });
}