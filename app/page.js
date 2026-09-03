export default function Home(){
  return (
    <div style={{fontFamily:'system-ui', padding: '40px'}}>
      <h1>Wix Learning Agent is Live ✅</h1>
      <p>API endpoints:</p>
      <ul>
        <li><code>/api/ask</code> - POST question</li>
        <li><code>/api/ingest</code> - POST content</li>
      </ul>
      <p>Widget: <code>/widget.js</code></p>
    </div>
  );
}
