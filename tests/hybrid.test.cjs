const {test}=require('node:test');const assert=require('node:assert/strict');const H=require('../hybrid.js');
const contacts=[{id:'y',platform:'yahoo',name:'Hân'},{id:'z',platform:'zalo',name:'Hân'},{id:'f',platform:'facebook',name:'Other'},{id:'z2',platform:'zalo',name:'Hân'}];
test('same display name does not merge identities',()=>assert.equal(H.groups(contacts).length,4));
test('explicit merge and unmerge preserve original accounts',()=>{const before=JSON.stringify(contacts);const links=H.merge(contacts,{},['z','f']);assert.equal(H.groups(contacts,links).length,3);assert.deepEqual(H.unmerge(links,'z'),{});assert.equal(JSON.stringify(contacts),before)});
test('rejects duplicate platforms including transitive groups',()=>{const links=H.merge(contacts,{},['y','z']);assert.throws(()=>H.merge(contacts,links,['y','z2']));assert.throws(()=>H.merge(contacts,{},['missing','z']))});
test('merging existing groups retains all members',()=>{const links=H.merge(contacts,H.merge(contacts,{},['y','z']),['z','f']);assert.equal(H.groups(contacts,links)[0].length,3)});
