import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function corsHeaders(){
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function OPTIONS(){
  return new Response(null, { headers: corsHeaders() });
}

export async function POST(req){
  try{
    const item = await req.json();
    const text = item.content || '';
    const emb = await openai.embeddings.create({ model: 'text-embedding-3-small', input: text.slice(0,8000) });
    const { error } = await supabase.from('documents').insert({
      content: text,
      source: item.source || 'wix-cms',
      embedding: emb.data[0].embedding
    });
    if(error) throw error;
    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
  }catch(e){
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
  }
}
