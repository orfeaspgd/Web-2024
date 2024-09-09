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
            if (!products || products.length === 0) {
                return res.status(404).json({ message: 'No products found for this search term' });
            }
            res.json(products);
        } catch (err) {
            console.error('Error fetching products by search term:', err);
            res.status(500).json({ message: 'Server error' });
        }
    });
}