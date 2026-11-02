'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const read=(k,f)=>{try{return JSON.parse(localStorage.getItem('yahoochat:'+k))??f}catch{return f}};
const write=(k,v)=>{try{localStorage.setItem('yahoochat:'+k,JSON.stringify(v))}catch{toast('Không thể lưu: bộ nhớ trình duyệt không khả dụng.')}};
let topZ=10,active='chat',current='nang_thuy_tinh',sound=read('sound',true),bold=false,italic=false;
const names={buddy:'😊 Yahoo! Messenger',chat:'✉ Conversation',player:'⚡ Winamp',notes:'📝 Notepad',about:'💻 About'};
const contacts=read('contacts',[{id:'nang_thuy_tinh',status:'Một chút nắng, một chút nhớ…'},{id:'lang_tu_8x',status:'♪ Đang nghe một bản nhạc cũ'},{id:'meo_con_9x',status:'Rảnh thì BUZZ mình nha :D'},{id:'co_be_mua_dong',status:'Offline',offline:true},{id:'chang_trai_thang_10',status:'Offline',offline:true}]);

// Migrate existing Yahoo IDs unchanged so saved conversations remain intact.
contacts.forEach(c=>{c.platform=Hybrid.platforms[c.platform]?c.platform:'yahoo';c.name=c.name||c.id});
if(!read('hybrid-seeded',false)){
  contacts.push({id:'demo:zalo:ngoc-han',name:'Ngọc Hân',platform:'zalo',status:'Đang đọc sách • Mô phỏng'},
    {id:'demo:facebook:ngoc-han',name:'Ngọc Hân',platform:'facebook',status:'Một ngày bình yên • Mô phỏng'},
    {id:'demo:zalo:minh',name:'Minh Anh',platform:'zalo',status:'Offline',offline:true},
    {id:'demo:facebook:nam',name:'Hoàng Nam',platform:'facebook',status:'Available • Mô phỏng'});
  write('contacts',contacts);write('hybrid-seeded',true);
}
let layout=read('layout','combined'),links=read('identity-links',{}),drafts=Object.create(null);
for(const platform of ['zalo','facebook']){
  const w=document.createElement('section');w.id=platform+'-buddy';w.className='window platform-buddy '+platform;w.hidden=true;
  w.setAttribute('aria-label',Hybrid.platforms[platform].name+' danh bạ mô phỏng');
  w.innerHTML='<header class="titlebar"><b>'+Hybrid.platforms[platform].name+' Messenger</b><div class="controls"><button data-min title="Thu nhỏ">_</button><button data-max title="Phóng to">□</button><button data-close title="Đóng">×</button></div></header><div class="platform-heading">'+Hybrid.platforms[platform].name+' <small>Danh bạ mô phỏng</small></div><div class="friends"><div class="platform-contacts"></div></div><footer class="buddy-footer">Chọn tài khoản để trò chuyện</footer>';
  const status=document.createElement('select');status.setAttribute('aria-label','Trạng thái '+Hybrid.platforms[platform].name+' (mô phỏng)');for(const value of ['Available','Away','Invisible']){const option=document.createElement('option');option.textContent=value;status.append(option)}status.value=read('status:'+platform,'Available');status.onchange=()=>write('status:'+platform,status.value);w.querySelector('.platform-heading').append(status);
  $('#desktop').append(w);names[w.id]=Hybrid.platforms[platform].name+' Messenger';
}

let history=Object.assign(Object.create(null),read('history',{})),pending=new Set(),toastTimer;
function toast(text){$('#toast').textContent=text;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,3500)}
function tasks(){ $('#tasks').replaceChildren();$$('.window').filter(w=>w.dataset.closed!=='true').forEach(w=>{let b=document.createElement('button');b.textContent=names[w.id];b.classList.toggle('active',active===w.id&&!w.hidden);b.onclick=()=>{if(active===w.id&&!w.hidden){w.hidden=true;active='';tasks()}else openWindow(w.id)};$('#tasks').append(b)}) }
function focusWindow(w){active=w.id;w.style.zIndex=++topZ;$$('.window').forEach(x=>x.classList.toggle('active',x===w));tasks()}
function openWindow(id){let w=document.getElementById(id);w.hidden=false;w.dataset.closed='false';focusWindow(w);$('#start-menu').hidden=true;$('#start').setAttribute('aria-expanded','false');if(id==='chat')$('#draft').focus()}
$$('.window').forEach(w=>{w.dataset.closed=String(w.hidden);w.addEventListener('pointerdown',()=>focusWindow(w));w.querySelector('[data-min]')?.addEventListener('click',()=>{w.hidden=true;active='';tasks()});w.querySelector('[data-close]').onclick=()=>{w.hidden=true;w.dataset.closed='true';active='';tasks()};const max=()=>{w.classList.toggle('maximized')};w.querySelector('[data-max]')?.addEventListener('click',max);const bar=w.querySelector('.titlebar');bar.ondblclick=e=>{if(!e.target.closest('button'))max()};bar.addEventListener('pointerdown',e=>{if(e.target.closest('button')||w.classList.contains('maximized'))return;let r=w.getBoundingClientRect(),x=e.clientX,y=e.clientY;bar.setPointerCapture(e.pointerId);const move=ev=>{w.style.left=Math.max(0,Math.min($('#desktop').clientWidth-w.offsetWidth,r.left+ev.clientX-x))+'px';w.style.top=Math.max(0,Math.min($('#desktop').clientHeight-32,r.top+ev.clientY-y))+'px';w.style.bottom='auto';w.style.right='auto'};const end=()=>{bar.removeEventListener('pointermove',move);bar.removeEventListener('pointerup',end);bar.removeEventListener('pointercancel',end)};bar.addEventListener('pointermove',move);bar.addEventListener('pointerup',end);bar.addEventListener('pointercancel',end)})});
$$('[data-open]').forEach(b=>b.onclick=()=>openWindow(b.dataset.open));
function showDesktop(){let visible=$$('.window').some(w=>!w.hidden);if(visible){$$('.window').forEach(w=>{w.dataset.wasVisible=String(!w.hidden);w.hidden=true});active=''}else{$$('.window').filter(w=>w.dataset.wasVisible==='true').forEach(w=>w.hidden=false)}tasks();$('#start-menu').hidden=true;$('#start').setAttribute('aria-expanded','false')}
$('#desktop-button').onclick=$('#show-desktop').onclick=showDesktop;
$('#start').onclick=()=>{$('#start-menu').hidden=!$('#start-menu').hidden;$('#start').setAttribute('aria-expanded',String(!$('#start-menu').hidden))};
document.addEventListener('pointerdown',e=>{if(!e.target.closest('#start-menu,#start')){$('#start-menu').hidden=true;$('#start').setAttribute('aria-expanded','false')}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('#start-menu').hidden=true;$('#emoji-picker').hidden=true;$('#start').setAttribute('aria-expanded','false')}});
window.addEventListener('resize',()=>{$$('.window').forEach(w=>{if(w.hidden||w.classList.contains('maximized'))return;let r=w.getBoundingClientRect();if(r.right>innerWidth)w.style.left=Math.max(0,innerWidth-w.offsetWidth)+'px';if(r.top>$('#desktop').clientHeight-40)w.style.top='20px'})});
$('#nickname').value=read('name','Long Ngo');$('#status').value=read('status','🟢 Available');$('#status-message').value=read('motto','');$('#note').value=read('note','Ngày ấy…\n\nChờ một nickname sáng đèn cũng đủ làm một ngày vui hơn.');
function updateName(){const n=$('#nickname').value.trim()||'Long Ngo';$('#my-name').textContent=$('#start-name').textContent=n;write('name',n)}$('#nickname').onchange=updateName;updateName();$('#status').onchange=()=>write('status',$('#status').value);$('#status-message').oninput=()=>write('motto',$('#status-message').value);$('#note').oninput=()=>write('note',$('#note').value);
function selectAccount(c){drafts[current]=$('#draft').value;current=c.id;$('#draft').value=drafts[current]||'';drawContacts();renderMessages();openWindow('chat')}
function contactRow(members){
  const row=document.createElement('div');row.className='contact-row';
  const c=members.find(c=>c.id===current)||members.find(c=>!c.offline)||members[0];
  const b=document.createElement('button');b.className='contact'+(members.every(c=>c.offline)?' offline':'')+(members.some(c=>c.id===current)?' selected':'');
  const icon=document.createElement('span');icon.textContent='☻';const label=document.createElement('span');label.textContent=members[0].name;
  const sub=document.createElement('small');sub.textContent=members.length>1?members.length+' tài khoản · chọn huy hiệu để chat':c.status;label.append(sub);b.append(icon,label);b.onclick=()=>selectAccount(c);row.append(b);
  const badges=document.createElement('div');badges.className='account-badges';
  members.forEach(account=>{const p=Hybrid.platforms[account.platform],badge=document.createElement('button');badge.textContent=p.badge;badge.className='badge '+account.platform;badge.title=p.name+' · '+account.id+' · '+(account.offline?'Offline':'Available')+' (mô phỏng)';badge.setAttribute('aria-label','Chat '+account.name+' qua '+p.name);badge.onclick=()=>selectAccount(account);badges.append(badge)});row.append(badges);return row;
}
function drawContacts(){
  const q=$('#search').value.toLocaleLowerCase('vi');
  const match=c=>(c.name+' '+c.id+' '+Hybrid.platforms[c.platform].name).toLocaleLowerCase('vi').includes(q);
  const target=$('#contacts');target.replaceChildren();
  const groups=layout==='split'?contacts.filter(c=>c.platform==='yahoo').map(c=>[c]):Hybrid.groups(contacts,links);
  const visible=groups.filter(g=>g.some(match));visible.forEach(g=>target.append(contactRow(g)));
  if(!visible.length)target.textContent='Không tìm thấy liên hệ.';
  $('.group span').textContent=`(${visible.length}/${groups.length})`;
  for(const platform of ['zalo','facebook']){const target=$('#'+platform+'-buddy .platform-contacts');target.replaceChildren();const list=contacts.filter(c=>c.platform===platform&&match(c));list.forEach(c=>target.append(contactRow([c])));if(!list.length)target.textContent='Không tìm thấy liên hệ.'}
}
function applyLayout(){
  const split=layout==='split';$('#layout-toggle').textContent=split?'▣ Gom chung':'▤ Tách riêng';$('#layout-toggle').setAttribute('aria-pressed',String(split));$('#desktop').classList.toggle('split-layout',split);
  for(const platform of ['zalo','facebook']){const w=$('#'+platform+'-buddy');w.hidden=!split;w.dataset.closed=String(!split)}
  if(split){$('#chat').hidden=true;$('#player').hidden=true}drawContacts();focusWindow($('#buddy'));write('layout',layout);
}
$('#layout-toggle').onclick=()=>{layout=layout==='split'?'combined':'split';applyLayout()};
function drawIdentityOptions(){
  $('#identity-options').replaceChildren();$('#identity-feedback').textContent='';
  Hybrid.groups(contacts,links).forEach(members=>{const group=document.createElement('div');group.className='identity-group';members.forEach(c=>{const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.value=c.id;label.append(input,document.createTextNode(c.name+' — '+Hybrid.platforms[c.platform].name+' ('+c.id+')'));group.append(label)});
  if(members.length>1){const unlink=document.createElement('button');unlink.type='button';unlink.textContent='Tách liên hệ này';unlink.onclick=()=>{links=Hybrid.unmerge(links,members[0].id);write('identity-links',links);drawIdentityOptions();drawContacts()};group.append(unlink)}$('#identity-options').append(group)});
}
$('#manage-identities').onclick=()=>{drawIdentityOptions();$('#identity-dialog').showModal()};
$('#merge-selected').onclick=()=>{try{links=Hybrid.merge(contacts,links,$$('#identity-options input:checked').map(i=>i.value));write('identity-links',links);drawIdentityOptions();drawContacts();$('#identity-feedback').textContent='Đã ghép. Lịch sử từng tài khoản được giữ riêng.'}catch(e){$('#identity-feedback').textContent=e.message}};
$('#search').oninput=drawContacts;$('#focus-search').onclick=()=>$('#search').focus();
$('#add-buddy').onclick=()=>{let id=prompt('Nickname Yahoo bạn muốn thêm (mô phỏng):');if(!id?.trim())return;id=id.trim().slice(0,40);if(contacts.some(c=>c.id===id))return toast('Nickname này đã có trong danh sách.');contacts.push({id,name:id,platform:'yahoo',status:'Bạn mới • Available'});write('contacts',contacts);drawContacts()};
function conversation(){if(!Array.isArray(history[current]))history[current]=[{who:'friend',text:'Ôi, lâu rồi mới thấy bạn online! :)',time:Date.now()-120000},{who:'friend',text:'Hôm nay thế nào? Ngồi đây nghe nhạc với mình một chút nhé. 🎵',time:Date.now()-60000}];return history[current]}
function renderMessages(){ $('#recipient').textContent=$('#avatar-name').textContent=current;const account=contacts.find(c=>c.id===current);const platform=Hybrid.platforms[account?.platform||'yahoo'];$('#chat-title').textContent=(account?.name||current)+' — '+platform.name+' · Mô phỏng';$('#recipient').textContent=(account?.name||current)+' · '+platform.name;$('#chat').dataset.platform=account?.platform||'yahoo';$('.online-dot').style.background=account?.offline?'#999':'#79ac36';$('#messages').replaceChildren();let hint=document.createElement('div');hint.className='system';hint.textContent='Một cuộc trò chuyện nhỏ, một miền ký ức lớn.\nBạn đang trò chuyện với nhân vật mô phỏng.';$('#messages').append(hint);for(const m of conversation()){const row=document.createElement('div');row.className='message'+(m.who==='me'?' me':'');if(m.buzz){row.className='buzz-message';row.textContent=(m.who==='me'?'Bạn':current)+' đã gửi BUZZ!!!'}else{let who=document.createElement('span');who.className='who';who.textContent=(m.who==='me'?($('#nickname').value||'Long Ngo'):current)+':';let time=document.createElement('time');time.textContent=new Date(m.time).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'});let text=document.createElement('div');text.className='text';renderEmoticons(text,m.text||'');if(m.who==='me'){text.style.fontWeight=m.bold?'bold':'normal';text.style.fontStyle=m.italic?'italic':'normal';text.style.color=m.color||'#262626'}if(m.emoji){let img=document.createElement('img');img.className='inline-smiley';img.src=`assets/smiley-${m.emoji}.gif`;img.alt='Mặt cười Yahoo';text.append(img)}row.append(who,time,text)}$('#messages').append(row)}$('#messages').scrollTop=$('#messages').scrollHeight}
function renderEmoticons(target,text){
  const codes={':)':1,':(':2,';)':3,':D':4};
  for(const piece of text.split(/(:\)|:\(|;\)|:D)/g)){
    if(codes[piece]){const img=document.createElement('img');img.src='assets/smiley-'+codes[piece]+'.gif';img.alt=piece;img.className='inline-smiley';target.append(img)}else target.append(document.createTextNode(piece));
  }
}
let dingContext;
function ding(){if(!sound)return;try{dingContext ||= new (window.AudioContext||window.webkitAudioContext)();if(dingContext.state!=='running')return;const oscillator=dingContext.createOscillator(),gain=dingContext.createGain();oscillator.frequency.setValueAtTime(880,dingContext.currentTime);gain.gain.setValueAtTime(.08,dingContext.currentTime);gain.gain.exponentialRampToValueAtTime(.001,dingContext.currentTime+.25);oscillator.connect(gain);gain.connect(dingContext.destination);oscillator.start();oscillator.stop(dingContext.currentTime+.25)}catch{}}
document.addEventListener('pointerdown',()=>{if(sound){try{dingContext ||= new (window.AudioContext||window.webkitAudioContext)();dingContext.resume().catch(()=>{})}catch{}}});
function addMessage(m,id=current){if(!Array.isArray(history[id]))history[id]=[];history[id].push({...m,time:Date.now()});history[id]=history[id].slice(-250);write('history',history);if(id===current)renderMessages()}
function reply(id,text){const c=contacts.find(c=>c.id===id);if(c?.offline){toast('Bạn này đang offline trong bản mô phỏng.');return}if(pending.has(id))return;pending.add(id);$('#typing').textContent=id+' đang nhập…';setTimeout(()=>{let answer=/chào|hello|hi\b/i.test(text)?'Chào bạn! Nhìn nickname sáng đèn là thấy vui rồi :D':/nhạc|music/i.test(text)?'Bật Winamp lên nhé! Bạn có thể mở nhạc ngay từ máy của mình. 🎶':/buzz/i.test(text)?'Giật cả mình! Mình đây mà :))':'Mình vẫn ở đây nè :) Kể tiếp đi, hôm nay bạn có gì vui?';addMessage({who:'friend',text:answer},id);ding();pending.delete(id);$('#typing').textContent='Enter để gửi · Shift + Enter để xuống dòng'},1100)}
$('#composer').onsubmit=e=>{e.preventDefault();const text=$('#draft').value.trim();if(!text)return;addMessage({who:'me',text,bold,italic,color:$('#color').value});$('#draft').value='';reply(current,text);$('#draft').focus()};$('#draft').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();$('#composer').requestSubmit()}};
$('#bold').onclick=()=>{bold=!bold;$('#bold').setAttribute('aria-pressed',String(bold));$('#draft').style.fontWeight=bold?'bold':'normal'};$('#italic').onclick=()=>{italic=!italic;$('#italic').setAttribute('aria-pressed',String(italic));$('#draft').style.fontStyle=italic?'italic':'normal'};$('#color').oninput=()=>$('#draft').style.color=$('#color').value;
for(let i=1;i<=24;i++){let b=document.createElement('button'),img=document.createElement('img');img.src=`assets/smiley-${i}.gif`;img.alt='Mặt cười '+i;b.title='Gửi mặt cười '+i;b.append(img);b.onclick=()=>{addMessage({who:'me',emoji:i,text:''});$('#emoji-picker').hidden=true;reply(current,':)')};$('#emoji-picker').append(b)}$('#emoji-toggle').onclick=()=>$('#emoji-picker').hidden=!$('#emoji-picker').hidden;
const buzzSound=new Audio('assets/buzz.wav');let lastBuzz=0;function buzz(){if(Date.now()-lastBuzz<1200)return;lastBuzz=Date.now();addMessage({who:'me',buzz:true});const desktop=$('#desktop');desktop.classList.remove('buzzing');void desktop.offsetWidth;desktop.classList.add('buzzing');setTimeout(()=>desktop.classList.remove('buzzing'),650);if(sound){buzzSound.currentTime=0;buzzSound.play().catch(()=>toast('Trình duyệt chưa cho phép phát âm thanh.'))}reply(current,'buzz')}
$('#buzz').onclick=$('#buzz-top').onclick=buzz;
function setSound(){sound=!sound;write('sound',sound);renderSound()}function renderSound(){$('#mute').textContent=sound?'🔊':'🔇';$('#sound-toggle').textContent='🔊 Âm thanh: '+(sound?'bật':'tắt');buzzSound.muted=!sound;audio.muted=!sound}$('#mute').onclick=$('#sound-toggle').onclick=setSound;
$('#clear-chat').onclick=()=>{if(confirm('Xóa lịch sử hội thoại với '+current+' trên trình duyệt này?')){history[current]=[];write('history',history);renderMessages()}};$('#save-chat').onclick=()=>{const text=conversation().map(m=>`${new Date(m.time).toLocaleString('vi-VN')} ${m.who==='me'?$('#nickname').value:current}: ${m.buzz?'BUZZ!!!':m.text||'[Mặt cười]'}`).join('\n');const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));let a=document.createElement('a');a.href=url;a.download='yahoo-conversation.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
const audio=new Audio('assets/memory.wav');audio.volume=.45;let tracks=[{name:'A Little Memory — Original loop',url:'assets/memory.wav'}],trackIndex=0;const fmt=n=>`${String(Math.floor(n/60)).padStart(2,'0')}:${String(Math.floor(n%60)).padStart(2,'0')}`;
function drawPlaylist(){$('#playlist').replaceChildren();tracks.forEach((t,i)=>{let b=document.createElement('button');b.textContent=String(i+1).padStart(2,'0')+'. '+t.name;b.className=i===trackIndex?'selected':'';b.onclick=()=>selectTrack(i,true);$('#playlist').append(b)})}
function selectTrack(i,play){trackIndex=i;audio.src=tracks[i].url;$('#track-name').textContent=String(i+1).padStart(2,'0')+'. '+tracks[i].name;drawPlaylist();if(play)audio.play().catch(()=>toast('Không phát được định dạng âm thanh này.'))}
$('#play').onclick=()=>audio.play().catch(()=>toast('Không phát được tệp nhạc. Hãy chọn MP3, WAV hoặc OGG.'));$('#pause').onclick=()=>audio.pause();$('#stop').onclick=()=>{audio.pause();audio.currentTime=0};audio.onplay=()=>{$('#player').classList.add('playing');$('#play-state').textContent='▶'};audio.onpause=()=>{$('#player').classList.remove('playing');$('#play-state').textContent='Ⅱ'};audio.onended=()=>selectTrack((trackIndex+1)%tracks.length,true);audio.ontimeupdate=()=>{$('#elapsed').textContent=fmt(audio.currentTime);$('#seek').value=Number.isFinite(audio.duration)?audio.currentTime/audio.duration*100:0};$('#seek').oninput=()=>{if(Number.isFinite(audio.duration))audio.currentTime=audio.duration*$('#seek').value/100};$('#volume').oninput=()=>audio.volume=Number($('#volume').value);
$('#music-files').onchange=e=>{const files=[...e.target.files];if(!files.length)return;audio.pause();tracks.forEach(t=>{if(t.url.startsWith('blob:'))URL.revokeObjectURL(t.url)});tracks=files.map(f=>({name:f.name,url:URL.createObjectURL(f)}));selectTrack(0,true)};
function clock(){$('#clock').textContent=new Date().toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'});$('#clock').title=new Date().toLocaleDateString('vi-VN')}clock();setInterval(clock,1000);drawContacts();renderMessages();drawPlaylist();renderSound();if(innerWidth<=760){$('#player').hidden=true;$('#chat').hidden=true;focusWindow($('#buddy'))}else focusWindow($('#chat'));

applyLayout();
