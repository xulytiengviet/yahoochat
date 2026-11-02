/* Room lifecycle adapted from opsbest/AnonChat; MIT notice in licenses/. */
(() => {
  'use strict';
  const el = id => document.getElementById(id);
  let socket, joined = false, pending = false;
  const status = text => { el('room-status').textContent = text; };
  const endpoint = window.YAHOO_CHAT_SERVER || (['localhost','127.0.0.1'].includes(location.hostname) ? location.origin : '');
  function controls() {
    el('room-draft').disabled = el('room-send').disabled = !joined || pending;
    el('room-share').disabled = el('room-leave').disabled = !joined;
    el('room-connect').disabled = !endpoint || pending;
    el('room-name').disabled = el('room-code').disabled = joined || pending;
  }
  function clear() {
    joined = false; pending = false;
    el('room-messages').replaceChildren(); el('room-users').replaceChildren();
    el('room-draft').value = ''; el('room-count').textContent = '0 người'; controls();
  }
  function append(text, name, ts, mine) {
    const row = document.createElement('div'); row.className = name ? 'message'+(mine?' me':'') : 'system';
    if(name) {
      const who = document.createElement('b'); who.className='who'; who.textContent=name+': ';
      const time = document.createElement('time'); time.textContent=new Date(ts).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'});
      const body = document.createElement('div'); body.className='text'; renderEmoticons(body,text);
      row.append(who,time,body);
    } else row.textContent=text;
    const log=el('room-messages'); log.append(row);
    while(log.children.length>250) log.firstChild.remove();
    log.scrollTop=log.scrollHeight;
  }
  const params = new URLSearchParams(location.hash.slice(1));
  el('room-code').value=(params.get('room')||'').slice(0,48);
  if(params.has('room')) openWindow('rooms');
  status(endpoint ? 'Đặt biệt danh và tên phòng để bắt đầu. Cùng tên phòng sẽ gặp nhau.' : 'Chưa cấu hình máy chủ chat. Giao diện đã sẵn sàng; cần triển khai backend để kết nối nhiều người.');
  controls();
  el('room-join').onsubmit=e=>{
    e.preventDefault(); if(!endpoint || pending || joined)return;
    if(typeof io!=='function'){status('Không tải được thư viện kết nối. Hãy tải lại trang.');return;}
    const room=el('room-code').value.trim().normalize('NFC'), name=el('room-name').value.trim();
    if(!/^[\p{L}\p{N} _-]{1,48}$/u.test(room)||!name){status('Nhập tên phòng bằng chữ/số, khoảng trắng, gạch ngang hoặc gạch dưới.');return;}
    socket?.disconnect(); clear(); pending=true; controls(); status('Đang kết nối máy chủ…');
    const client=socket=io(endpoint,{autoConnect:false,reconnection:false,timeout:20000});
    client.on('connect',()=>{
      client.timeout(8000).emit('join room',{room,name},(err,result)=>{
        if(client!==socket)return;
        pending=false;
        if(err||!result?.ok){status(result?.error||'Không nhận được xác nhận vào phòng.');client.disconnect();controls();return;}
        joined=true; controls(); el('room-code').value=result.room;
        status('Đang ở phòng “'+result.room+'” · '+result.name);
        append('Bạn đã vào phòng. Lịch sử bắt đầu từ thời điểm này.'); el('room-draft').focus();
      });
    });
    client.on('connect_error',()=>{if(client!==socket)return;pending=false;controls();status('Không kết nối được. Máy chủ có thể đang khởi động; thử lại sau khoảng một phút.');client.disconnect();});
    client.on('disconnect',()=>{if(client!==socket)return;joined=false;pending=false;el('room-users').replaceChildren();el('room-count').textContent='0 người';controls();status('Đã ngắt kết nối. Nhấn Tạo / Vào phòng để kết nối lại; tin chưa gửi không tự gửi lại.');});
    client.on('chat message',m=>{if(client!==socket||!joined)return;append(m.text,m.callsign,m.ts,m.id===client.id);if(m.id!==client.id)ding();});
    client.on('system',m=>{if(client===socket&&joined)append(m.text);});
    client.on('userlist',data=>{
      if(client!==socket)return;
      el('room-users').replaceChildren();
      for(const user of data.users){const li=document.createElement('li');li.textContent=user.name+(user.id===client.id?' (bạn)':'');el('room-users').append(li);}
      el('room-count').textContent=data.users.length+' người';
    });
    client.connect();
  };
  el('room-compose').onsubmit=e=>{
    e.preventDefault(); if(!joined||!socket?.connected||pending)return;
    const text=el('room-draft').value.trim();if(!text)return;
    pending=true;controls();const client=socket;
    client.timeout(8000).emit('chat message',{text},(err,result)=>{
      if(client!==socket)return;
      pending=false;controls();
      if(err||!result?.ok)status(result?.error||'Chưa xác nhận được tin nhắn. Kiểm tra hội thoại trước khi gửi lại.');
      else {el('room-draft').value='';status('Đang ở phòng “'+el('room-code').value+'”');}
      if(joined)el('room-draft').focus();
    });
  };
  el('room-draft').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();el('room-compose').requestSubmit();}};
  el('room-leave').onclick=()=>{const old=socket;socket=null;old?.disconnect();clear();status('Đã rời phòng và xóa lịch sử trên trang của bạn.');};
  el('room-share').onclick=async()=>{
    const url=new URL(location.href);url.hash=new URLSearchParams({room:el('room-code').value}).toString();
    try{await navigator.clipboard.writeText(url.href);status('Đã sao chép link mời vào phòng.');}catch{prompt('Sao chép link mời:',url.href);}
  };
  window.addEventListener('pagehide',()=>{const old=socket;socket=null;old?.disconnect();clear();});
})();
