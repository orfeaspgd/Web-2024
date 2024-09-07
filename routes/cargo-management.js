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
}