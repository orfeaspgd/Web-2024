import {
    Users,
    Announcements,
    Products,
    Tasks,
    Categories,
    WarehouseProducts,
    Vehicles
} from '../schemas.js';

export default function categoriesRoutes(app, cache) {
    // Get products by category id
    app.get('/get-products-by-category/:categoryId', async (req, res) => {
        try {
            const products = await Products.find({ category: req.params.categoryId }, 'name');
            if (!products || products.length === 0) {
                return res.status(404).json({ message: 'No products found for this category' });
            }
            res.json(products);
        } catch (err) {
            console.error('Error fetching products by category:', err);
            res.status(500).json({ message: 'Server error' });
        }
    });

    // Get products by searching (autocomplete)
    app.get('/get-products-by-searching/:searchTerm', async (req, res) => {
        try {
            const products = await Products.find({ name: { $regex: req.params.searchTerm, $options: 'i' } }, 'name');

            // Respond with the products found
            res.json(products);
        } catch (err) {
            console.error('Error fetching products by search term:', err);
            res.status(500).json({ message: 'Server error' });
        }
    });

    // Create a new request
    app.post('/create-request', async (req, res) => {
        try {
            // Check if user is logged in
            if (!req.session.user) {
                return res.status(401).json({message: 'Not authenticated'});
            }

            // Access the citizen ID from the session user object
            const citizenId = req.session.user._id;

            // Access the product ID and quantity from the request body
            const { product_id, peopleCount } = req.body;

            // Create a new request
            const newRequest = new Tasks({
                citizen_id: citizenId,
                rescuer_id: null,
                product_id: product_id,
                // We assume that the quantity of the requested product is the number of people to be rescued
                quantity: peopleCount,
                type: 'request',
                status: 'pending',
                createdAt: new Date(),
                assignedAt: null,
                completedAt: null
            });

            // Save the new task in the database
            await newRequest.save();

            // Respond with the created request
            res.status(201).json(newRequest);
        } catch (error) {
            console.error('Error creating request:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });

    // Get all requests by a citizen
    app.get('/get-requests-by-citizen', async (req, res) => {
        try {
            // Check if user is logged in
            if (!req.session.user) {
                return res.status(401).json({message: 'Not authenticated'});
            }

            // Access the citizen ID from the session user object
            const citizenId = req.session.user._id;

            // Find all requests by the citizen
            const requests = await Tasks.find({ citizen_id: citizenId, type: 'request' })
                .populate('product_id', 'name')
                .populate('rescuer_id', 'name surname')
                .select('status quantity createdAt assignedAt completedAt');

            // Respond with the requests
            res.json(requests);
        } catch (error) {
            console.error('Error fetching requests by citizen:', error);
            res.status(500).json({ message: 'Server error' });
        }
    });
}