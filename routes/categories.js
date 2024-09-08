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
//get all categories
    app.get('/categories', async (req, res) => {
        try {
            const cachedData = cache.get('categories');
            if(cachedData) {
                return res.json(cachedData);
            } else {
                const categories = await Categories.find({}, 'category_name');
                cache.set('categories', categories);
                res.json(categories);
            }
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    });
}