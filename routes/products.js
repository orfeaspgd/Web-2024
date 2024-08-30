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

export default function productsRoutes(app) {
//get all products
  app.get('/products', async (req, res) => {
    try {
      const products = await Products.find({}, 'name');
      res.json(products);
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