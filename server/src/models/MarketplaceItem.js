import mongoose from 'mongoose';

const marketplaceItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 500
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'] // 👈 SIRF URL STORE HOGA
  },
  seller: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: String,
    email: String
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'reserved'],
    default: 'available'
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true // createdAt, updatedAt自动添加
});

// Text search ke liye index
marketplaceItemSchema.index({ title: 'text', description: 'text' });

const MarketplaceItem = mongoose.model('MarketplaceItem', marketplaceItemSchema);
export default MarketplaceItem;