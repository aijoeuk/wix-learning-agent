
import { supabase } from '../../../lib/supabase.js';
import OpenAI from 'openai';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(req) {
  try {
    const { question } = await req.json();
    if (!question) {
      return new Response(JSON.stringify({ error: 'No question' }), { status: 400, headers: corsHeaders });
    }

    // simple keyword search - no embeddings needed
    const keywords = question.split(' ').filter(w => w.length > 3).slice(0,3);
    let query = supabase.from('documents').select('content, source').limit(5);
    
    if (keywords.length > 0) {
      query = query.ilike('content', `%${keywords[0]}%`);
    }

    const { data: docs, error } = await query;
    if (error) throw error;

    const context = docs?.map(d => d.content).join('\n---\n') || 'No relevant docs found yet.';

    // Try OpenAI if key works, otherwise return raw context
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful tutor. Answer using this context:\n' + context },
          { role: 'user', content: question }
        ]
      });
      return new Response(JSON.stringify({ answer: completion.choices[0].message.content, sources: docs }), { status: 200, headers: corsHeaders });
    } catch (aiErr) {
      // fallback if OpenAI billing missing - return raw docs
      return new Response(JSON.stringify({ 
        answer: `OpenAI billing missing (error: ${aiErr.message}), but I found ${docs?.length || 0} relevant docs:\n\n` + context.substring(0,1000),
        sources: docs,
        warning: 'Add $5 OpenAI credit for real AI answers'
      }), { status: 200, headers: corsHeaders });
    }
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
}
