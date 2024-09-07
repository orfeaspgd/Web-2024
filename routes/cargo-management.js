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
                .populate('product_id');

            // Map the warehouse products to only include the product name and quantity
            const warehouseProducts = warehouse.map(item => ({
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

            // If the warehouse product does not exist or the quantity is insufficient
            if (!warehouseProduct || warehouseProduct.quantity < quantity) {
                return res.status(400).json({ message: 'Insufficient product quantity in warehouse' });
            }

            // Check if the product is already in the vehicle
            const cargoItem = vehicle.cargo.find(item => item.product_id.equals(product_id));
            if (cargoItem) {
                cargoItem.quantity += quantity;
            } else {
                vehicle.cargo.push({ product_id, quantity });
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
}