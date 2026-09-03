import OpenAI from 'openai';
import { supabase } from '../../../lib/supabase.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  const { question, userEmail } = await req.json();

  // 1. Embed the question
  const emb = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: question
  });

  // 2. Search Supabase vector DB
  const { data: docs } = await supabase.rpc('match_documents', {
    query_embedding: emb.data[0].embedding,
    match_threshold: 0.78,
    match_count: 5
  });

  const context = (docs || []).map(d => d.content).join('\n---\n');

  // 3. Get user progress if available
  let progress = null;
  if (userEmail) {
    const { data } = await supabase.from('user_progress').select('*').eq('email', userEmail).single();
    progress = data;
  }

  // 4. Ask LLM
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: `You are the AI Art & Prompt tutor for this Wix site covering blogs, AI art tools, prompt generator, and AI learning. Answer ONLY from this context:\n${context}\nIf not in context, say you don't know. Always suggest next blog to read. User progress: ${JSON.stringify(progress)}` },
      { role: 'user', content: question }
    ]
  });

  return Response.json({ answer: completion.choices[0].message.content, sources: docs });
}

// Vector search function - create this in Supabase SQL:
// create or replace function match_documents(query_embedding vector(1536), match_threshold float, match_count int)
// returns table(id uuid, content text, source text, similarity float)
// language sql as $$
// select id, content, source, 1 - (documents.embedding <=> query_embedding) as similarity
// from documents where 1 - (documents.embedding <=> query_embedding) > match_threshold
// order by documents.embedding <=> query_embedding limit match_count; $$;
