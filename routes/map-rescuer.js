import {
    Users,
    Announcements,
    Products,
    Tasks,
    Categories,
    WarehouseProducts,
    Vehicles
} from '../schemas.js';

export default function mapRescuerRoutes(app, cache) {
    // Get data for the map display
    app.get('/map-rescuer-data', async (req, res) => {
        // Check if user is logged in
        if (!req.session.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const rescuerId = req.session.user._id;  // Access the user ID from the session user object

        try {
            // Fetch the warehouse location
            const warehouse = await Users.findOne({ role: 'admin' }).select('location');

            // Fetch the rescuer's vehicle and its data
            const vehicle = await Vehicles.findOne({ rescuer_id: rescuerId })
                .populate('rescuer_id', 'location')
                .populate('cargo.product_id', 'name')
                .populate('task_ids', 'type status');

            // Fetch tasks that are either assigned to the current rescuer or are pending and unassigned
            const tasks = await Tasks.find({
                $or: [
                    { rescuer_id: rescuerId },
                    { rescuer_id: null, status: 'pending' }
                ]
            })
                .populate('citizen_id', 'name surname phone_number location')
                .populate('product_id', 'name');

            res.json({
                vehicle,
                tasks,
                warehouse
            });
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });

    // Update the location of the rescuer (vehicle)
    app.put('/update-rescuer-location', async (req, res) => {
        // Check if user is logged in
        if (!req.session.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const rescuerId = req.session.user._id;  // Access the user ID from the session user object

        try {
            const { latitude, longitude } = req.body;

            await Users.findOneAndUpdate({ _id: rescuerId }, {
                location: {
                    latitude,
                    longitude
                }
            });

            res.json({
                message: 'Rescuer location updated successfully'
            });
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });

    // Claim a task
    app.put('/claim-task', async (req, res) => {
        // Check if user is logged in
        if (!req.session.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const rescuerId = req.session.user._id;  // Access the user ID from the session user object
        const taskId = req.body.taskId;

        try {
            // Count tasks assigned to the rescuer and that are still 'in_progress'
            const taskCount = await Tasks.countDocuments({ rescuer_id: rescuerId, status: 'in_progress' });

            // If the rescuer already has 4 tasks, prevent assigning more
            if (taskCount >= 4) {
                return res.status(400).json({ message: 'You can only have up to 4 assigned tasks.' });
            }

            // Update the task to assign it to the rescuer
            await Tasks.findByIdAndUpdate(taskId, { rescuer_id: rescuerId, status: "in_progress", assignedAt: new Date() });

            // Find the vehicle associated with this rescuer
            const vehicle = await Vehicles.findOne({ rescuer_id: rescuerId });

            // Add the taskId to the vehicle's task_ids array
            vehicle.task_ids.push(taskId);
            await vehicle.save();

            res.json({
                message: 'Task claimed successfully and assigned to rescuer vehicle'
            });
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });
}