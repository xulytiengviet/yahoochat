// Adapted from opsbest/AnonChat server.js (MIT); see licenses/AnonChat-MIT.txt.
const express = require('express');
const http = require('node:http');
const path = require('node:path');
const { Server } = require('socket.io');
function createChatServer({ origins = ['https://xulytiengviet.github.io'], rateLimit = 10 } = {}) {
  const app = express(), server = http.createServer(app);
  const allowed = origin => !origin || origins.includes(origin);
  const io = new Server(server, { maxHttpBufferSize: 8192,
    cors: { origin(origin, cb) { cb(null, allowed(origin)); } },
    allowRequest(req, cb) { cb(null, allowed(req.headers.origin)); }
  });
  const rooms = new Map();
  app.get('/health', (req, res) => res.json({ ok: true }));
  // Only serve browser assets, never the repository or server sources.
  const root = path.join(__dirname, '..');
  for (const file of ['index.html','style.css','app.js','hybrid.js','rooms.js','chat-config.js'])
    app.get('/' + (file === 'index.html' ? '' : file), (req, res) => res.sendFile(path.join(root, file)));
  for (const folder of ['assets','vendor']) app.use('/'+folder, express.static(path.join(root, folder)));
  function users(room) { return [...(rooms.get(room)?.values() || [])]; }
  function presence(room) { io.to('chat:'+room).emit('userlist', { users: users(room) }); }
  function leave(socket) {
    const room = socket.data.room;
    if (!room) return;
    socket.leave('chat:'+room);
    const members = rooms.get(room); members?.delete(socket.id);
    if (!members?.size) rooms.delete(room);
    else { presence(room); io.to('chat:'+room).emit('system', {text: socket.data.callsign+' đã rời phòng.'}); }
    delete socket.data.room;
  }
  io.on('connection', socket => {
    let events = [], lastJoin = 0;
    socket.on('join room', (payload, ack) => {
      const reply = typeof ack === 'function' ? ack : () => {};
      if (Date.now()-lastJoin < 500) return reply({error:'Vui lòng chờ trước khi đổi phòng.'});
      lastJoin = Date.now();
      if (!payload || typeof payload.room !== 'string' || typeof payload.name !== 'string') return reply({error:'Thiếu tên phòng hoặc biệt danh.'});
      const room = payload.room.trim().normalize('NFC'), name = payload.name.trim().normalize('NFC');
      if (!/^[\p{L}\p{N} _-]{1,48}$/u.test(room) || !name || name.length > 32 || /[\p{C}]/u.test(name)) return reply({error:'Tên phòng 1–48 ký tự chữ/số; biệt danh 1–32 ký tự.'});
      if (!rooms.has(room) && rooms.size >= 200) return reply({error:'Máy chủ đã đầy phòng.'});
      if ((rooms.get(room)?.size || 0) >= 50 && socket.data.room !== room) return reply({error:'Phòng đã đủ 50 người.'});
      leave(socket);
      socket.data.room = room; socket.data.callsign = name;
      if (!rooms.has(room)) rooms.set(room, new Map());
      rooms.get(room).set(socket.id, {id:socket.id, name});
      socket.join('chat:'+room);
      reply({ok:true, room, name, id:socket.id});
      presence(room);
      socket.to('chat:'+room).emit('system', {text:name+' đã vào phòng.'});
    });
    socket.on('chat message', (payload, ack) => {
      const reply = typeof ack === 'function' ? ack : () => {};
      if (!socket.data.room) return reply({error:'Bạn chưa vào phòng.'});
      if (!payload || typeof payload.text !== 'string' || !payload.text.trim() || payload.text.length > 2000) return reply({error:'Tin nhắn phải có 1–2000 ký tự.'});
      const now = Date.now(); events = events.filter(t => now-t < 5000);
      if (events.length >= rateLimit) return reply({error:'Gửi quá nhanh. Hãy chờ vài giây.'});
      events.push(now);
      io.to('chat:'+socket.data.room).emit('chat message', {id:socket.id, callsign:socket.data.callsign, text:payload.text.trim(), ts:now});
      reply({ok:true});
    });
    socket.on('leave room', () => leave(socket));
    socket.on('disconnect', () => leave(socket));
  });
  return { server, io, rooms };
}
if (require.main === module) {
  const origins = (process.env.ALLOWED_ORIGINS || 'https://xulytiengviet.github.io,http://localhost:3000').split(',').map(s=>s.trim());
  const {server, io} = createChatServer({origins});
  server.listen(process.env.PORT || 3000, '0.0.0.0', () => console.log('YahooChat rooms ready'));
  process.on('SIGTERM', () => { io.close(); server.close(); });
}
module.exports = { createChatServer };
