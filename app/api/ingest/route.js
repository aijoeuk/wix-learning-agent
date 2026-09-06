
import { supabase } from '../../../lib/supabase.js';
import OpenAI from 'openai';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS(){ return new Response(null, {status:204, headers:cors}); }

export async function POST(req){
  try{
    const { content, source, title } = await req.json();
    if(!content) return new Response(JSON.stringify({error:'No content'}), {status:400, headers:cors});
    const clean = content.substring(0,5000);
    let embedding = null;
    let mode = 'keyword';
    try{
      const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});
      const emb = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: clean
      });
      embedding = emb.data[0].embedding;
      mode = 'smart-embedding';
    }catch(e){
      console.warn('Embedding failed, fallback to text:', e.message);
      mode = 'keyword-fallback (add $5 OpenAI credit for smart search)';
    }

    // Try vector insert first, then text fallback
    let error = null;
    if(embedding){
      const { error: err1 } = await supabase.from('documents').insert({ content: clean, source: source||title||'wix-blog', embedding });
      error = err1;
      if(err1 && err1.message.includes('text')){
        // table has text column, retry as string
        const { error: err2 } = await supabase.from('documents').insert({ content: clean, source: source||title||'wix-blog', embedding: null });
        error = err2;
        mode += ' + text-column';
      }
    } else {
      const { error: err } = await supabase.from('documents').insert({ content: clean, source: source||title||'wix-blog', embedding: null });
      error = err;
    }

    if(error) throw error;
    return new Response(JSON.stringify({ok:true, mode, source}), {status:200, headers:cors});
  }catch(err){
    console.error(err);
    return new Response(JSON.stringify({error: err.message}), {status:500, headers:cors});
  }
}
