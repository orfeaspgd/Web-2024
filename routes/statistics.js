import {
    Users,
    Announcements,
    Products,
    Tasks,
    Categories,
    WarehouseProducts,
    Vehicles
} from '../schemas.js';

export default function statisticsRoutes(app, cache) {
    app.get('/task-statistics', async (req, res) => {
        try {
            // Extract startDate and endDate from query parameters
            const { startDate, endDate } = req.query;

            // Initialize filters
            const createdAtFilter = {};
            const completedAtFilter = {};

            // Build the date range filter for task creation and completion
            if (startDate && endDate) {
                createdAtFilter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
                completedAtFilter.completedAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
            } else if (startDate) {
                createdAtFilter.createdAt = { $gte: new Date(startDate) };
                completedAtFilter.completedAt = { $gte: new Date(startDate) };
            } else if (endDate) {
                createdAtFilter.createdAt = { $lte: new Date(endDate) };
                completedAtFilter.completedAt = { $lte: new Date(endDate) };
            }

            // Fetch new and completed tasks with filters
            const newRequestsCount = await Tasks.countDocuments({
                ...createdAtFilter,
                status: { $in: ['pending', 'in_progress'] },
                type: 'request'
            });

            const newOffersCount = await Tasks.countDocuments({
                ...createdAtFilter,
                status: { $in: ['pending', 'in_progress'] },
                type: 'offer'
            });

            const completedRequestsCount = await Tasks.countDocuments({
                ...completedAtFilter,
                status: 'completed',
                type: 'request'
            });

            const completedOffersCount = await Tasks.countDocuments({
                ...completedAtFilter,
                status: 'completed',
                type: 'offer'
            });

            // Return the statistics as a JSON response
            res.json({
                newRequestsCount,
                newOffersCount,
                completedRequestsCount,
                completedOffersCount
            });
        } catch (error) {
            console.error('Error fetching task statistics:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });
}