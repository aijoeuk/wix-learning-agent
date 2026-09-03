// Simple embed widget for Wix
(function(){
  const containerId = 'ai-tutor';
  let el = document.getElementById(containerId);
  if(!el){ el = document.createElement('div'); el.id = containerId; document.body.appendChild(el); }
  el.innerHTML = `
  <div style="position:fixed;bottom:20px;right:20px;width:360px;max-height:70vh;background:white;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,0.15);font-family:system-ui;display:flex;flex-direction:column;overflow:hidden;z-index:9999">
    <div style="background:#111;color:white;padding:12px 16px;font-weight:600">AI Learning Tutor</div>
    <div id="tutor-messages" style="flex:1;overflow:auto;padding:12px;font-size:14px"></div>
    <div style="display:flex;border-top:1px solid #eee"><input id="tutor-input" placeholder="Ask about prompts, tools..." style="flex:1;border:0;padding:12px;outline:none"/><button id="tutor-send" style="border:0;background:#111;color:white;padding:0 16px;cursor:pointer">Ask</button></div>
  </div>`;
  const messages = document.getElementById('tutor-messages');
  const input = document.getElementById('tutor-input');
  const sendBtn = document.getElementById('tutor-send');
  const API = document.currentScript ? new URL(document.currentScript.src).origin : 'https://your-project.vercel.app';

  async function ask(){
    const q = input.value.trim(); if(!q) return;
    messages.innerHTML += '<div style="margin:8px 0"><b>You:</b> '+q+'</div>';
    input.value='';
    messages.innerHTML += '<div style="margin:8px 0;color:#666">Thinking...</div>';
    messages.scrollTop = messages.scrollHeight;
    try{
      const res = await fetch(API+'/api/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:q})});
      const data = await res.json();
      messages.lastChild.remove();
      messages.innerHTML += '<div style="margin:8px 0;background:#f5f5f5;padding:8px 10px;border-radius:8px">'+data.answer.replace(/\n/g,'<br>')+'</div>';
      messages.scrollTop = messages.scrollHeight;
    }catch(e){ messages.lastChild.innerText='Error: '+e.message; }
  }
  sendBtn.onclick = ask; input.onkeydown = (e)=>{ if(e.key==='Enter') ask(); };
})();
