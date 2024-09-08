import {
    Users,
    Announcements,
    Products,
    Tasks,
    Categories,
    WarehouseProducts,
    Vehicles
} from '../schemas.js';

import NodeCache from 'node-cache';

export default function categoriesRoutes(app, cache) {
//get all categories
    app.get('/categories', async (req, res) => {
        try {
            const cachedData = cache.get('categories');
            if(cachedData) {
                console.log('Cache hit');
                return res.json(cachedData);
            } else {
                console.log('Cache miss');
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