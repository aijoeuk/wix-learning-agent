import OpenAI from 'openai';
import { supabase } from '../../../lib/supabase.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  const item = await req.json(); // expects { content, source } or Wix CMS item
  const text = item.content || item.title + '\n' + (item.prompt_text || item.description || '');

  const emb = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.slice(0, 8000)
  });

  const { error } = await supabase.from('documents').insert({
    content: text,
    source: item.source || item._id || 'wix-cms',
    embedding: emb.data[0].embedding
  });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
