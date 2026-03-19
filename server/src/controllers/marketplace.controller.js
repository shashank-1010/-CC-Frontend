import MarketplaceItem from '../models/MarketplaceItem.js';
import { supabase, BUCKET_NAME } from '../config/supabase.js';
import crypto from 'crypto';

// Helper function: Unique filename generate karo
const generateFileName = (originalName) => {
  const timestamp = Date.now();
  const random = crypto.randomBytes(16).toString('hex');
  const extension = originalName.split('.').pop();
  return `marketplace/${timestamp}-${random}.${extension}`;
};

// 📤 1. IMAGE UPLOAD - Sirf URL return karega
export const uploadImage = async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'Koi file upload nahi hui' 
      });
    }

    const file = req.file;
    
    // File size check (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ 
        success: false, 
        error: 'File size 5MB se zyada hai' 
      });
    }

    // Unique filename banao
    const fileName = generateFileName(file.originalname);
    
    console.log('📤 Uploading to Supabase:', fileName);

    // 📤 Supabase Storage mein upload karo
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('❌ Supabase upload error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Upload failed: ' + error.message 
      });
    }

    // 🔗 Public URL generate karo
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    console.log('✅ Upload successful! URL generated');

    // ✅ Sirf URL return karo
    res.json({
      success: true,
      imageUrl: urlData.publicUrl,
      message: 'Image uploaded successfully'
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Upload failed: ' + error.message 
    });
  }
};

// 📝 2. CREATE ITEM - URL MongoDB mein store karo
export const createItem = async (req, res) => {
  try {
    const { title, price, description, imageUrl } = req.body;
    
    // Validation
    if (!title || !price || !description || !imageUrl) {
      return res.status(400).json({ 
        success: false, 
        error: 'All fields required' 
      });
    }

    // User info from auth middleware
    const user = req.user;

    // 🗄️ MongoDB mein save karo (sirf URL)
    const newItem = await MarketplaceItem.create({
      title,
      price: parseFloat(price),
      description,
      imageUrl, // 👈 YAHI URL STORE HO RAHA HAI
      seller: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

    res.status(201).json({
      success: true,
      item: newItem
    });

  } catch (error) {
    console.error('❌ Create item error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// 📥 3. GET ALL ITEMS
export const getItems = async (req, res) => {
  try {
    const items = await MarketplaceItem.find({ status: 'available' })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({
      success: true,
      items
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// 📥 4. GET SINGLE ITEM
export const getItemById = async (req, res) => {
  try {
    const item = await MarketplaceItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        error: 'Item not found' 
      });
    }
    
    // Increment views
    item.views += 1;
    await item.save();
    
    res.json({
      success: true,
      item
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// 🔍 5. SEARCH ITEMS
export const searchItems = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ 
        success: false, 
        error: 'Search query required' 
      });
    }
    
    const items = await MarketplaceItem.find({
      $text: { $search: q },
      status: 'available'
    }).sort({ score: { $meta: 'textScore' } });
    
    res.json({
      success: true,
      items
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// ✏️ 6. UPDATE ITEM
export const updateItem = async (req, res) => {
  try {
    const item = await MarketplaceItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        error: 'Item not found' 
      });
    }
    
    // Check ownership
    if (item.seller.id.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        error: 'Not authorized' 
      });
    }
    
    // Update fields
    const { title, price, description, imageUrl, status } = req.body;
    
    if (title) item.title = title;
    if (price) item.price = price;
    if (description) item.description = description;
    if (imageUrl) item.imageUrl = imageUrl; // 👈 URL update
    if (status) item.status = status;
    
    await item.save();
    
    res.json({
      success: true,
      item
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// ❌ 7. DELETE ITEM
export const deleteItem = async (req, res) => {
  try {
    const item = await MarketplaceItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        error: 'Item not found' 
      });
    }
    
    // Check ownership
    if (item.seller.id.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        error: 'Not authorized' 
      });
    }
    
    // 🗑️ Extract filename from URL and delete from Supabase
    try {
      const urlParts = item.imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `marketplace/${fileName}`;
      
      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);
      
      if (storageError) {
        console.warn('⚠️ Failed to delete image from storage:', storageError);
        // Continue with item deletion even if image delete fails
      }
    } catch (storageError) {
      console.warn('⚠️ Error deleting image:', storageError);
    }
    
    // 🗑️ Delete from MongoDB
    await item.deleteOne();
    
    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// 📥 8. GET USER'S ITEMS
export const getUserItems = async (req, res) => {
  try {
    const items = await MarketplaceItem.find({ 
      'seller.id': req.user.id 
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      items
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};