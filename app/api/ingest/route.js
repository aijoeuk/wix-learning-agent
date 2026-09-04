
import { supabase } from '../../../lib/supabase.js';

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
    const { content, source, title } = await req.json();
    if (!content) {
      return new Response(JSON.stringify({ error: 'No content provided' }), { status: 400, headers: corsHeaders });
    }

    const cleanContent = content.substring(0, 5000);

    const { error } = await supabase.from('documents').insert({
      content: cleanContent,
      source: source || title || 'wix-blog',
      embedding: null
    });

    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, message: 'Saved without embedding (no OpenAI billing needed)', source }), { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({
        error: err.message,
        cause: err.cause ? String(err.cause) : null,
        causeCode: err.cause?.code || null,
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}
