import mongoose from 'mongoose';

const usersSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    surname: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        match: /.+@.+\..+/,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'citizen', 'rescuer'],
        required: true
    },
    phone_number: {
        type: Number,
        required: true,
        trim: true
    },
    location: {
        latitude: {
            type: Number,
            required: function() {
                return this.role === 'rescuer' || this.role === 'citizen';
                }
            },
        longitude: {
            type: Number,
            required: function() {
                return this.role === 'rescuer' || this.role === 'citizen';
            }
        },
    }
}, { versionKey: false });

const AnnouncementSchema = new mongoose.Schema({
    admin_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
        trim: true
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products',
        required: true,
        trim: true
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
}, { versionKey: false });

const productsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false,
        trim: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories',
        required: true,
        trim: true
    },
    details: [
        {
            detail_name:
                {
                    type: String,
                    required: false,
                    trim: true
                },
            detail_value:
                {
                    type: String,
                    required: false,
                    trim: true
                },
            _id: false
        }
    ],
    id: {
        type: Number,
        required: false,
        trim: true
    },
}, { versionKey: false });

const taskSchema = new mongoose.Schema({
    task_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        trim: true
    },
    citizen_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
        trim: true
    },
    rescuer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
        trim: true
    },
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products',
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['request', 'donation'],
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed'],
        required: true
    }
}, { versionKey: false });

const categoriesSchema = new mongoose.Schema({
    category_name: {
        type: String,
        required: false,
        trim: true
    }
}, { versionKey: false });

const warehouseProductsSchema = new mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products',
        required: true,
        trim: true
    },
    quantity: {
        type: Number,
        required: true
    }
}, { versionKey: false });


export const Users = mongoose.model('users', usersSchema);
export const Announcements = mongoose.model('announcements', AnnouncementSchema);
export const Products = mongoose.model('products', productsSchema);
export const Tasks = mongoose.model('tasks', taskSchema);
export const Categories = mongoose.model('categories', categoriesSchema);
export const WarehouseProducts = mongoose.model('warehouse_products', warehouseProductsSchema);

