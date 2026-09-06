
import { supabase } from '../../../lib/supabase.js';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS(){ return new Response(null, {status:204, headers:cors}); }

export async function GET() {
  try {
    const url = process.env.SUPABASE_URL || 'MISSING';
    const keySet = !!process.env.SUPABASE_KEY;
    const openaiSet = !!process.env.OPENAI_API_KEY;

    // Try to list documents
    let tableCheck = 'not checked';
    try {
      const { data, error } = await supabase.from('documents').select('id').limit(1);
      if (error) tableCheck = 'ERROR: ' + error.message;
      else tableCheck = 'OK - found ' + (data?.length || 0) + ' rows, table exists';
    } catch (e) {
      tableCheck = 'EXCEPTION: ' + e.message;
    }

    return new Response(JSON.stringify({
      supabase_url_host: url.replace('https://','').substring(0, 25) + '...',
      supabase_url_full: url.substring(0, 40),
      supabase_key_set: keySet,
      openai_key_set: openaiSet,
      table_check: tableCheck,
      hint: 'If table_check says Invalid path, your Vercel env vars point to old/deleted Supabase project'
    }, null, 2), { status: 200, headers: cors });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: cors });
  }
}
