/**
 * Supabase Database Integration Client & CRUD Adapter
 * SuperUMKM Platform Engine
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey && supabaseUrl.startsWith('http'));

let supabase = null;

if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
    console.log(`⚡ [Supabase DB Engine] Successfully connected to: ${supabaseUrl}`);
  } catch (err) {
    console.error('❌ [Supabase Client Error]:', err.message);
  }
} else {
  console.log('ℹ️ [Database Engine] Running in Bootstrapped In-Memory Mode (Set SUPABASE_URL & keys in .env to enable Supabase)');
}

/**
 * Universal Generic CRUD helper for Supabase tables
 */
const supabaseDb = {
  isConfigured: () => Boolean(supabase),

  // 1. READ ALL / SELECT
  async selectAll(tableName, filter = {}) {
    if (!supabase) return null;
    let query = supabase.from(tableName).select('*');
    Object.keys(filter).forEach(key => {
      query = query.eq(key, filter[key]);
    });
    const { data, error } = await query;
    if (error) {
      console.error(`Supabase SELECT error on ${tableName}:`, error.message);
      return null;
    }
    return data;
  },

  // 2. READ ONE BY ID
  async selectById(tableName, id) {
    if (!supabase) return null;
    const { data, error } = await supabase.from(tableName).select('*').eq('id', id).single();
    if (error) return null;
    return data;
  },

  // 3. INSERT / CREATE
  async insert(tableName, record) {
    if (!supabase) return null;
    const { data, error } = await supabase.from(tableName).insert(record).select();
    if (error) {
      console.error(`Supabase INSERT error on ${tableName}:`, error.message);
      return null;
    }
    return data ? data[0] : record;
  },

  // 4. UPDATE / PUT
  async update(tableName, id, updates) {
    if (!supabase) return null;
    const { data, error } = await supabase.from(tableName).update(updates).eq('id', id).select();
    if (error) {
      console.error(`Supabase UPDATE error on ${tableName}:`, error.message);
      return null;
    }
    return data ? data[0] : updates;
  },

  // 5. DELETE
  async delete(tableName, id) {
    if (!supabase) return false;
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) {
      console.error(`Supabase DELETE error on ${tableName}:`, error.message);
      return false;
    }
    return true;
  }
};

module.exports = {
  supabase,
  supabaseDb,
  isSupabaseConfigured
};
