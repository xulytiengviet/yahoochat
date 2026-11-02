const {test}=require('node:test');
const assert=require('node:assert/strict');
const {io:connect}=require('socket.io-client');
const {createChatServer}=require('../server/index.cjs');
const once=(s,event)=>new Promise(resolve=>s.once(event,resolve));
const emit=(s,event,data)=>new Promise((resolve,reject)=>s.timeout(1500).emit(event,data,(err,v)=>err?reject(err):resolve(v)));
test('rooms isolate live messages, retain no history, clean membership, and validate inputs',async t=>{
 const app=createChatServer({rateLimit:2});
 await new Promise(r=>app.server.listen(0,'127.0.0.1',r));
 const url='http://127.0.0.1:'+app.server.address().port, clients=[];
 t.after(()=>{clients.forEach(s=>s.disconnect());app.io.close();app.server.close();});
 async function client(){const s=connect(url,{transports:['websocket'],forceNew:true});clients.push(s);await once(s,'connect');return s;}
 const a=await client(),b=await client(),c=await client();
 assert.equal((await emit(a,'chat message',{text:'before join'})).error,'Bạn chưa vào phòng.');
 for(const [s,room,name] of [[a,'Bến Tre','Long'],[b,'Bến Tre','Bạn'],[c,'Khác','Khách']]) assert.equal((await emit(s,'join room',{room,name})).ok,true);
 const received=[],other=[];b.on('chat message',m=>received.push(m));c.on('chat message',m=>other.push(m));
 const delivery=once(b,'chat message');
 assert.equal((await emit(a,'chat message',{text:'<img src=x onerror=alert(1)>',callsign:'spoof'})).ok,true);
 const m=await delivery;assert.equal(m.callsign,'Long');assert.equal(m.text,'<img src=x onerror=alert(1)>');
 assert.equal((await emit(a,'chat message',{text:'x'.repeat(2001)})).error,'Tin nhắn phải có 1–2000 ký tự.');
 await emit(a,'chat message',{text:'second'});
 assert.match((await emit(a,'chat message',{text:'third'})).error,/quá nhanh/);
 const d=await client(),replayed=[];d.on('chat message',m=>replayed.push(m));
 await emit(d,'join room',{room:'Bến Tre',name:'Mới'});
 await new Promise(r=>setTimeout(r,70));
 assert.equal(replayed.length,0);assert.equal(other.length,0);assert.equal(received.length,2);
 assert.equal(app.rooms.get('Bến Tre').size,3);
 b.disconnect();a.disconnect();d.disconnect();
 await new Promise(r=>setTimeout(r,70));assert.equal(app.rooms.has('Bến Tre'),false);
 const bad=await client();assert.ok((await emit(bad,'join room',{room:'../bad',name:'x'})).error);
});
test('rejects unapproved browser origins',async t=>{
 const app=createChatServer();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));
 const s=connect('http://127.0.0.1:'+app.server.address().port,{transports:['websocket'],reconnection:false,extraHeaders:{Origin:'https://not-allowed.example'}});
 t.after(()=>{s.disconnect();app.io.close();app.server.close();});
 await once(s,'connect_error');assert.equal(s.connected,false);
});
