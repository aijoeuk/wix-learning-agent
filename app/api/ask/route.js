
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
    const { question } = await req.json();
    if(!question) return new Response(JSON.stringify({error:'No question'}), {status:400, headers:cors});
    
    let docs = [];
    let searchMode = 'keyword';

    // Try smart vector search first
    try{
      const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});
      const emb = await openai.embeddings.create({ model: 'text-embedding-3-small', input: question });
      const { data, error } = await supabase.rpc('match_documents', {
        query_embedding: emb.data[0].embedding,
        match_threshold: 0.2,
        match_count: 5
      });
      if(!error && data && data.length>0){
        docs = data;
        searchMode = 'smart-embedding';
      }
    }catch(e){
      console.warn('Vector search failed, using keyword:', e.message);
    }

    // Fallback keyword search
    if(docs.length===0){
      const kw = question.split(' ').filter(w=>w.length>3)[0] || question.substring(0,10);
      const { data } = await supabase.from('documents').select('content, source').ilike('content', `%${kw}%`).limit(5);
      docs = data || [];
      searchMode = searchMode.includes('smart') ? searchMode : 'keyword';
    }

    const context = docs.map(d=>d.content).join('\n---\n') || 'No docs found. Import blogs first.';
    
    try{
      const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {role:'system', content:'You are a helpful tutor for Wix blog content. Answer using this context:\n'+context},
          {role:'user', content: question}
        ]
      });
      return new Response(JSON.stringify({answer: completion.choices[0].message.content, sources: docs, mode: searchMode}), {status:200, headers:cors});
    }catch(aiErr){
      return new Response(JSON.stringify({
        answer: `Found ${docs.length} docs (Add $5 OpenAI credit for AI answers):\n\n`+context.substring(0,1500),
        sources: docs,
        mode: searchMode+' (no OpenAI billing)',
        warning: aiErr.message
      }), {status:200, headers:cors});
    }
  }catch(err){
    return new Response(JSON.stringify({error: err.message}), {status:500, headers:cors});
  }
}
