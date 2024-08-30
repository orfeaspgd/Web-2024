import {
    Users,
    Announcements,
    Products,
    Tasks,
    Categories,
    WarehouseProducts,
    Vehicles
} from '../schemas.js';

export default function importRoutes(app) {
    //populate database with data from usidas
    app.post('/pull_from_usidas', async (req, res) => {
        try{const usidasJson = await fetch("http://usidas.ceid.upatras.gr/web/2023/export.php")
            const result = await usidasJson.json()
            let newCategories = []
            for (let i = 0; i < result.categories.length; i++){
                if(await Categories.findOne({ category_name: result.categories[i].category_name }) === null){
                    newCategories.push(result.categories[i])
                }
            }

            let newProducts = []
            for (let i = 0; i < result.items.length; i++){
                if(await Products.findOne({ id: result.items[i].id }) === null){
                    newProducts.push(result.items[i])
                }
            }

            let products    = newProducts.map(current_product => { //replace category id with category name in products
                const product_category = result.categories.find(current_category => current_category.id.trim() === current_product.category.trim()) //find category of product
                current_product.category = product_category.category_name                                                  // replace category id with category name
                return current_product
            })
            let categories    = newCategories.map(current_product => { //remove id from categories
                delete current_product.id;
                return current_product
            })

            await Categories.insertMany(categories)
            let findCategories = await Categories.find({})
            await Products.insertMany(                                //replace category name with category mongo id in products
                products.map(current_product => {
                    current_product.category = findCategories.find(current_category => {
                        //if === condition matches, get the mongo id of the category and replace it me to product category
                        return current_category.category_name.trim() === current_product.category.trim()})._id
                    return current_product
                })
            )
            res.json({ status: 'success', message: 'Products added.' })
        }
        catch (err) {
            res.status(500).send(err);
            console.log(err);
            res.json({status: 'error', message: 'Something went wrong.'})
        }
    });
    //populate database with json file
    app.post('/add_products_from_json', async (req, res) => {
        try{
            const result = JSON.parse(req.body.fileContents)
            let newCategories = []
            for (let i = 0; i < result.categories.length; i++){
                if(await Categories.findOne({ category_name: result.categories[i].category_name }) === null){
                    newCategories.push(result.categories[i])
                }
            }

            let newProducts = []
            for (let i = 0; i < result.items.length; i++){
                if(await Products.findOne({ id: result.items[i].id }) === null){
                    newProducts.push(result.items[i])
                }
            }

            let products    = newProducts.map(current_product => { //replace category id with category name in products
                const product_category = result.categories.find(current_category => current_category.id.trim() === current_product.category.trim()) //find category of product
                current_product.category = product_category.category_name                                                  // replace category id with category name
                return current_product
            })
            let categories    = newCategories.map(current_product => { //remove id from categories
                delete current_product.id;
                return current_product
            })

            await Categories.insertMany(categories)
            let findCategories = await Categories.find({})
            await Products.insertMany(                                //replace category name with category mongo id in products
                products.map(current_product => {
                    current_product.category = findCategories.find(current_category => current_category.category_name.trim() === current_product.category.trim())._id //if === condition matches, get the mongo id of the category and replace it me to product category
                    return current_product
                })
            )
            res.json({ status: 'success', message: 'Products added.' })
        }
        catch (err) {
            res.status(500).send(err);
            console.log(err);
            res.json({status: 'error', message: 'Something went wrong.'})
        }
    });
}
