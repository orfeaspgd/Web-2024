import {
    Users,
    Announcements,
    Products,
    Tasks,
    Categories,
    WarehouseProducts,
    Vehicles
} from '../schemas.js';

export default function cargoManagementRoutes(app) {
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

    // View Products on the Rescuer's Vehicle (Cargo)
    app.get('/view-vehicle-cargo', async (req, res) => {
        // Check if user is logged in
        if (!req.session.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        // Access the user ID from the session user object
        const rescuerId = req.session.user._id;

        try {
            // Find the vehicle that belongs to the rescuer
            const vehicle = await Vehicles.findOne({ rescuer_id: rescuerId })
                .populate('cargo.product_id');

            // Map the cargo array to only include the product name and quantity
            const cargo = vehicle.cargo.map(item => ({
                product: item.product_id.name,
                quantity: item.quantity
            }));

            res.json(cargo);
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    });

    // View Products in Warehouse
    app.get('/view-warehouse-products', async (req, res) => {
        try {
            // Find all warehouse products and populate the product_id field
            const warehouse = await WarehouseProducts.find()
                .populate('product_id', 'name');

            // Map the warehouse products to only include the product name and quantity
            const warehouseProducts = warehouse.map(item => ({
                warehouseId: item._id,
                productId: item.product_id._id,
                product: item.product_id.name,
                quantity: item.quantity
            }));

            res.json(warehouseProducts);
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    });

    // Load Product to Vehicle (Cargo) from Warehouse
    app.post('/load-product-to-vehicle', async (req, res) => {
        // Check if user is logged in
        if (!req.session.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        // Access the user ID from the session user object
        const rescuerId = req.session.user._id;

        const { productId, quantity } = req.body;

        try {
            // Find the vehicle that belongs to the rescuer
            const vehicle = await Vehicles.findOne({ rescuer_id: rescuerId });

            // Find the warehouse product by product ID
            const warehouseProduct = await WarehouseProducts.findOne({ product_id: productId });

            // If the warehouse product does not exist
            if (!warehouseProduct) {
                return res.status(400).json({ message: 'Product not found in warehouse' });
            }

            // If the quantity is insufficient
            if (warehouseProduct.quantity < quantity) {
                return res.status(400).json({ message: 'Insufficient product quantity in warehouse' });
            }

            // Check if the product is already in the vehicle's cargo
            const cargoItem = vehicle.cargo.find(item => item.product_id.equals(productId));
            if (cargoItem) {
                cargoItem.quantity += parseInt(quantity, 10);
            } else {
                vehicle.cargo.push({ product_id: productId, quantity: parseInt(quantity, 10) });
            }

            // Update the quantity of the warehouse product
            warehouseProduct.quantity -= quantity;
            await warehouseProduct.save();

            // Update the vehicle cargo
            await vehicle.save();

            res.json({ message: 'Product loaded successfully to vehicle' });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    });

    // Unload All Products from Vehicle (Cargo) to Warehouse
    app.post('/unload-all-products-from-vehicle', async (req, res) => {
        // Check if user is logged in
        if (!req.session.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        // Access the user ID from the session user object
        const rescuerId = req.session.user._id;

        try {
            // Find the vehicle that belongs to the rescuer
            const vehicle = await Vehicles.findOne({ rescuer_id: rescuerId })
                .populate('cargo.product_id');

            // Check if the vehicle's cargo is empty
            if (vehicle.cargo.length === 0) {
                return res.status(400).json({ message: 'No products to unload' });
            }

            // For each product in the vehicle cargo
            for (const item of vehicle.cargo) {
                const warehouseProduct = await WarehouseProducts.findOne({ product_id: item.product_id._id });

                // Update the quantity of the warehouse product
                warehouseProduct.quantity += item.quantity;
                await warehouseProduct.save();
            }

            // Remove all products from the vehicle cargo
            vehicle.cargo = [];

            // Update the vehicle cargo
            await vehicle.save();

            res.json({ message: 'All products unloaded successfully to warehouse' });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    });

    // Check if the distance between the rescuer's location and the warehouse is within 100metres
    app.get('/check-distance-to-warehouse-for-cargo', async (req, res) => {
        // Check if user is logged in
        if (!req.session.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        // Access the user ID from the session user object
        const rescuerId = req.session.user._id;

        try {
            // Fetch warehouse's location which is the location of the admin
            const warehouse = await Users.findOne({role: 'admin'}).select('location');

            // Fetch the rescuer's location
            const rescuer = await Users.findById(rescuerId).select('location');

            // Calculate the distance between the two locations
            const distance = calculateDistance(
                warehouse.location.latitude,
                warehouse.location.longitude,
                rescuer.location.latitude,
                rescuer.location.longitude
            );

            if (distance < 100) {
                res.json({
                    distance: distance,
                    message: 'Rescuer is within 100 metres of the warehouse',
                    withinDistance: true
                });
            } else {
                res.json({
                    distance: distance,
                    message: 'Rescuer is not within 100 metres of the warehouse',
                    withinDistance: false
                });
            }
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    });
}