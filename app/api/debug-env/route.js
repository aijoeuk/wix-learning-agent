// TEMPORARY diagnostic route — delete after debugging.
// Reveals no secrets: only lengths, prefixes, and whether a URL parses.

export async function GET() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  let urlParseError = null
  let parsedHost = null
  try {
    const u = new URL(url)
    parsedHost = u.host
  } catch (e) {
    urlParseError = e.message
  }

  return new Response(
    JSON.stringify(
      {
        SUPABASE_URL_present: !!process.env.SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_URL_present: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        SUPABASE_KEY_present: !!process.env.SUPABASE_KEY,
        NEXT_PUBLIC_SUPABASE_ANON_KEY_present: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        resolved_url_length: url.length,
        resolved_url_first_20_chars: url.slice(0, 20),
        resolved_url_last_10_chars: url.slice(-10),
        resolved_url_has_leading_whitespace: url !== url.trimStart(),
        resolved_url_has_trailing_whitespace: url !== url.trimEnd(),
        resolved_url_has_newline: url.includes('\n') || url.includes('\r'),
        resolved_url_parses_ok: !urlParseError,
        resolved_url_parse_error: urlParseError,
        resolved_url_parsed_host: parsedHost,
        resolved_key_length: key.length,
        resolved_key_first_6_chars: key.slice(0, 6),
        resolved_key_has_whitespace_or_newline: /\s/.test(key),
      },
      null,
      2
    ),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}
