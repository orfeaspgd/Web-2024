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

    // Check if the distance between the rescuer's location and the task location is within 50 meters
    app.get('/check-distance-to-task-for-complete-button', async (req, res) => {
        try {
            // Check if user is logged in
            if (!req.session.user) {
                return res.status(401).json({ message: 'Not authenticated' });
            }

            // Access the rescuer ID from the session user object
            const rescuerId = req.session.user._id;

            // Fetch the rescuer's location
            const rescuer = await Users.findById(rescuerId).select('location');

            // Fetch the tasks assigned to this rescuer
            const tasks = await Tasks.find({ rescuer_id: rescuerId, status: 'in_progress' })
                .populate('citizen_id', 'location');

            // Check if there are no tasks assigned or in progress
            if (!tasks.length) {
                return res.status(404).json({ message: 'No tasks assigned or in progress' });
            }

            // Array to store task distances and status of completion button activation
            const taskDistances = tasks.map((task) => {
                const citizenLocation = task.citizen_id.location;
                const rescuerLocation = rescuer.location;
                const distance = calculateDistance(
                    rescuerLocation.latitude,
                    rescuerLocation.longitude,
                    citizenLocation.latitude,
                    citizenLocation.longitude
                );

                return {
                    task_id: task._id,
                    distance,
                    withinRange: distance <= 50
                };
            });

            // Respond with task distances and whether the "Complete" button should be enabled
            res.status(200).json({
                message: 'Distance check complete',
                taskDistances,
            });
        } catch (error) {
            console.error('Error checking task distance:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });
}