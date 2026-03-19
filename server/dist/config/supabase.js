"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testSupabaseConnection = exports.BUCKET_NAME = exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load env
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase credentials missing!');
    process.exit(1);
}
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
exports.BUCKET_NAME = process.env.SUPABASE_BUCKET || 'CUCONNECT';
// ✅ YEH FUNCTION EXPORT HONA CHAHIYE
const testSupabaseConnection = async () => {
    try {
        const { data, error } = await exports.supabase.storage.listBuckets();
        if (error) {
            console.error('❌ Supabase connection test failed:', error.message);
            return false;
        }
        const bucketExists = data?.some(bucket => bucket.name === exports.BUCKET_NAME);
        if (!bucketExists) {
            console.warn(`⚠️ Bucket '${exports.BUCKET_NAME}' not found.`);
        }
        else {
            console.log(`✅ Supabase bucket '${exports.BUCKET_NAME}' is ready`);
        }
        console.log('✅ Supabase connected successfully');
        return true;
    }
    catch (error) {
        console.error('❌ Supabase connection test failed:', error);
        return false;
    }
};
exports.testSupabaseConnection = testSupabaseConnection;
