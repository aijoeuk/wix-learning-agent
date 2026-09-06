
(function(){
  const s=document.currentScript;
  const api=s.getAttribute('data-api-url')||s.src.replace('/widget.js','');
  const btn=document.createElement('div');
  btn.innerHTML='💬'; btn.style.cssText='position:fixed;bottom:20px;right:20px;width:60px;height:60px;background:#000;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:99999;font-size:28px;';
  const box=document.createElement('div');
  box.style.cssText='position:fixed;bottom:90px;right:20px;width:360px;height:460px;background:#fff;border-radius:16px;box-shadow:0 8px 30px rgba(0,0,0,.2);display:none;flex-direction:column;z-index:99999;overflow:hidden;font-family:system-ui;';
  box.innerHTML=`<div style="padding:16px;background:#000;color:#fff;font-weight:600;">Your AI Tutor <span style="float:right;cursor:pointer" id="closeTutor">✕</span></div><div id="msgs" style="flex:1;padding:16px;overflow:auto;font-size:14px;"></div><div style="padding:12px;border-top:1px solid #eee;display:flex;gap:8px;"><input id="q" placeholder="Ask about our blogs..." style="flex:1;padding:10px;border:1px solid #ddd;border-radius:8px;"><button id="send" style="background:#000;color:#fff;border:0;padding:10px 16px;border-radius:8px;cursor:pointer;">Ask</button></div>`;
  document.body.appendChild(btn); document.body.appendChild(box);
  btn.onclick=()=>box.style.display=box.style.display==='flex'?'none':'flex';
  box.querySelector('#closeTutor').onclick=()=>box.style.display='none';
  async function ask(){
    const input=box.querySelector('#q'); const msgs=box.querySelector('#msgs'); const q=input.value; if(!q) return;
    msgs.innerHTML+=`<div style="margin:8px 0;text-align:right;"><span style="background:#000;color:#fff;padding:8px 12px;border-radius:12px;display:inline-block;">${q}</span></div>`; input.value='';
    const res=await fetch(api+'/api/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:q})}); const data=await res.json();
    msgs.innerHTML+=`<div style="margin:8px 0;"><span style="background:#f3f3f3;padding:8px 12px;border-radius:12px;display:inline-block;">${(data.answer||data.error||'No answer').replace(/\n/g,'<br>')}</span></div>`; msgs.scrollTop=msgs.scrollHeight;
  }
  box.querySelector('#send').onclick=ask; box.querySelector('#q').onkeydown=e=>{if(e.key==='Enter') ask();};
})();
