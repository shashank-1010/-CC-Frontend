import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// ✅ .env file load karo
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Environment se values lo
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const BUCKET_NAME = process.env.SUPABASE_BUCKET || 'CUCONNECT';  // ✅ YEH IMPORTANT

console.log('🔧 Using bucket:', BUCKET_NAME);  // Debug line

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
  console.log('🚀 Testing Supabase Connection...');
  console.log('📦 Bucket configured:', BUCKET_NAME);
  
  try {
    // 1. TEST CONNECTION
    console.log('📡 Checking connection...');
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return;
    }
    
    console.log('✅ Connected! Available buckets:', data.map(b => b.name));
    
    // 2. CHECK IF BUCKET EXISTS
    const bucketExists = data.some(b => b.name === BUCKET_NAME);
    
    if (!bucketExists) {
      console.log(`❌ Bucket '${BUCKET_NAME}' not found in available buckets!`);
      console.log('📋 Available buckets:', data.map(b => b.name).join(', '));
      return;
    }
    
    console.log(`✅ Bucket '${BUCKET_NAME}' exists`);
    
    // 3. CREATE TEST IMAGE
    const testImagePath = path.join(__dirname, 'test-image.jpg');
    
    if (!fs.existsSync(testImagePath)) {
      console.log('📸 Creating test image...');
      // 1x1 pixel JPEG
      const dummyImage = Buffer.from([
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
        0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
        0x00, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
        0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
        0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
        0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
        0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
        0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01, 0x00, 0x01, 0x01, 0x01, 0x11,
        0x00, 0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x03,
        0xFF, 0xC4, 0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA,
        0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F, 0x00, 0x37, 0xFF, 0xD9
      ]);
      fs.writeFileSync(testImagePath, dummyImage);
    }
    
    const imageBuffer = fs.readFileSync(testImagePath);
    const fileName = `test-${Date.now()}.jpg`;
    
    // 4. UPLOAD TO SUPABASE
    console.log('📤 Uploading to Supabase bucket:', BUCKET_NAME);
    console.log('📄 Filename:', fileName);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)  // ✅ AB YE 'CUCONNECT' HOGA
      .upload(`public/${fileName}`, imageBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600'
      });
    
    if (uploadError) {
      console.error('❌ Upload failed:', uploadError.message);
      return;
    }
    
    console.log('✅ Upload successful!');
    
    // 5. GET PUBLIC URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(`public/${fileName}`);
    
    console.log('🔗 Public URL:', urlData.publicUrl);
    
    // 6. CLEANUP
    console.log('🧹 Cleaning up...');
    await supabase.storage
      .from(BUCKET_NAME)
      .remove([`public/${fileName}`]);
    
    fs.unlinkSync(testImagePath);
    
    console.log('🎉 All tests passed! Supabase is working perfectly!');
    
  } catch (err) {
    console.error('💥 Unexpected error:', err);
  }
}

testSupabase();