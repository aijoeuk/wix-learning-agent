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
    const { question } = await req.json();
    const emb = await openai.embeddings.create({ model: 'text-embedding-ada-002', input: question });
    const { data: docs } = await supabase.rpc('match_documents', {
      query_embedding: emb.data[0].embedding,
      match_threshold: 0.5,
      match_count: 5
    });
    const context = (docs || []).map(d => d.content).join('\n---\n');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: `You are the AI Art tutor. Use this context:\n${context}` },
        { role: 'user', content: question }
      ]
    });
    return new Response(JSON.stringify({ answer: completion.choices[0].message.content, sources: docs }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders() }
    });
  }catch(e){
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
  }
}
