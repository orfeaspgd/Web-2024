import {
    Users,
    Announcements,
    Products,
    Tasks,
    Categories,
    WarehouseProducts,
    Vehicles,
    Warehouse
} from '../schemas.js';

export default function categoriesRoutes(app) {
//get all categories
    app.get('/categories', async (req, res) => {
        try {
            const categories = await Categories.find({}, 'category_name');
            res.json(categories);
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });
}