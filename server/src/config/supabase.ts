import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials missing!');
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseKey);
export const BUCKET_NAME = process.env.SUPABASE_BUCKET || 'CUCONNECT';

// ✅ YEH FUNCTION EXPORT HONA CHAHIYE
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
      console.error('❌ Supabase connection test failed:', error.message);
      return false;
    }
    
    const bucketExists = data?.some(bucket => bucket.name === BUCKET_NAME);
    if (!bucketExists) {
      console.warn(`⚠️ Bucket '${BUCKET_NAME}' not found.`);
    } else {
      console.log(`✅ Supabase bucket '${BUCKET_NAME}' is ready`);
    }
    
    console.log('✅ Supabase connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error);
    return false;
  }
};