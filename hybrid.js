/* Pure identity model: display names are never identity keys. */
(function(root){
  const platforms={yahoo:{name:'Yahoo!',badge:'Y!',color:'#713a94'},zalo:{name:'Zalo',badge:'Z',color:'#087ad2'},facebook:{name:'Facebook',badge:'f',color:'#315a99'}};
  function groups(contacts,links={}){
    const result=new Map();
    for(const c of contacts){const key=typeof links[c.id]==='string'?links[c.id]:'account:'+c.id;if(!result.has(key))result.set(key,[]);result.get(key).push(c)}
    return [...result.values()];
  }
  function merge(contacts,links,ids){
    const chosen=contacts.filter(c=>ids.includes(c.id));
    if(chosen.length<2)throw Error('Chọn ít nhất hai tài khoản.');
    const selectedGroups=new Set(chosen.map(c=>links[c.id]).filter(Boolean));
    const members=contacts.filter(c=>ids.includes(c.id)||selectedGroups.has(links[c.id]));
    if(new Set(members.map(c=>c.platform)).size!==members.length)throw Error('Mỗi liên hệ chỉ ghép một tài khoản trên mỗi nền tảng.');
    const next={...links},key='person:'+members.map(c=>c.id).sort().join('|');
    members.forEach(c=>next[c.id]=key);return next;
  }
  function unmerge(links,id){const next={...links},key=next[id];if(key)Object.keys(next).forEach(k=>{if(next[k]===key)delete next[k]});return next}
  const api={platforms,groups,merge,unmerge};root.Hybrid=api;if(typeof module!=='undefined')module.exports=api;
})(globalThis);
