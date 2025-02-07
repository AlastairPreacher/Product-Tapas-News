import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';
import { debugLog, debugError } from '../utils/debug';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

function validateEnvironment(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!SUPABASE_URL) {
    errors.push('Missing VITE_SUPABASE_URL environment variable');
  }
  if (!SUPABASE_ANON_KEY) {
    errors.push('Missing VITE_SUPABASE_ANON_KEY environment variable');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

async function testConnection(client: ReturnType<typeof createClient<Database>>) {
  try {
    const { data, error } = await client
      .from('articles')
      .select('id')
      .limit(1);

    if (error) throw error;
    return true;
  } catch (error) {
    debugError('Supabase', 'Connection test failed:', error);
    return false;
  }
}

export async function getSupabaseClient() {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const { isValid, errors } = validateEnvironment();
  
  if (!isValid) {
    debugError('Supabase', 'Environment validation failed:', errors);
    throw new Error(`Supabase initialization failed: ${errors.join(', ')}`);
  }

  try {
    debugLog('Supabase', 'Initializing client...');
    const client = createClient<Database>(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    );

    // Test the connection
    const isConnected = await testConnection(client);
    if (!isConnected) {
      throw new Error('Failed to connect to Supabase');
    }

    supabaseInstance = client;
    debugLog('Supabase', 'Client initialized successfully');
    return client;
  } catch (error) {
    debugError('Supabase', 'Failed to initialize Supabase client:', error);
    throw error;
  }
}

export function clearSupabaseClient() {
  supabaseInstance = null;
}