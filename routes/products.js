import {
  Users,
  Announcements,
  Products,
  Tasks,
  Categories,
  WarehouseProducts,
  Vehicles
} from '../schemas.js';

export default function productsRoutes(app, cache) {
//get all products
  app.get('/products', async (req, res) => {
    try {
      const cachedData = cache.get('products');
      if(cachedData) {
        return res.json(cachedData);
      } else {
        const products = await Products.find({}, 'name');
        cache.set('products', products);
        res.json(products);
      }
    } catch (err) {
      console.error(err);
      res.status(500).send(err);
    }
  });

  //get product by id
  app.get('/product/:id', async (req, res) => {
    try {
      const product = await Products.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
}