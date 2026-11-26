window.Auth = (() => {
 const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
 const users = () => read('ipdeokUsers', []);
 const user = () => users().find(u => u.id === localStorage.getItem('ipdeokUser')) || null;
 const key = k => k + ':' + (user()?.id || 'guest');
 const root = new URL('../', document.currentScript.src);
 const login = () => { sessionStorage.setItem('ipdeokReturn', location.href); location.href = new URL('sub/login/login.html', root); };
 const save = (k,v) => localStorage.setItem(key(k),v);
 const get = k => localStorage.getItem(key(k));
 return {users,user,key,login,save,get,root};
})();
document.addEventListener('DOMContentLoaded', () => {
 const u = Auth.user();
 if (!u) return;
 document.querySelectorAll('.side-menu-list a').forEach(a => {
  if (!a.getAttribute('href')?.endsWith('login.html')) return;
  a.textContent = u.name + '님 · 로그아웃';
  a.href = '#';
  a.onclick = e => { e.preventDefault(); localStorage.removeItem('ipdeokUser'); location.reload(); };
 });
});

window.Collection = (() => {
 const map={list1:'original',list2:'rose',list3:'mala',list4:'jjajang',list5:'cream',list6:'cheese',set1:'original',set2:'rose',set3:'mala',set4:'cheese'};
 const names={original:'오리지널',rose:'로제',mala:'마라',jjajang:'짜장',cream:'크림',cheese:'치즈'};
 const read=()=>{try{const d=JSON.parse(Auth.get('collection')||'{}');return {cards:d.cards||[],used:d.used||0,orders:d.orders||{}};}catch{return {cards:[],used:0,orders:{}};}};
 const save=d=>Auth.save('collection',JSON.stringify(d));
 const available=()=>Math.max(0,Math.floor(read().cards.length/5)-read().used);
 const result=(d,c)=>({card:c,count:d.cards.length,reward:c.reward===true});
 function claim(id,kind){if(!Auth.user())return null;const d=read(), old=d.cards.find(c=>c.id===id);if(old)return result(d,old);const o=d.orders[id];if(!o||!o.choices.includes(kind)||o.claimed)return null;const c={id,kind,name:names[kind],date:o.date,items:o.items,reward:(d.cards.length+1)%5===0};o.claimed=true;d.cards.push(c);save(d);return result(d,c);}
 function award(order,useCoupon){if(!Auth.user()||order.memberId!==Auth.user().id)return null;const d=read(),id=order.number;const old=d.cards.find(c=>c.id===id);if(old)return result(d,old);if(d.orders[id])return d.orders[id].choices.length?{pending:true,id}:null;if(useCoupon&&available()<1)throw Error('쿠폰 없음');const choices=[...new Set(order.products.filter(p=>p.quantity>0).map(p=>map[p.id]||map[p.image?.replace('.png','')]).filter(Boolean))];d.orders[id]={choices,date:new Date().toISOString(),items:order.products.map(p=>p.name+' × '+p.quantity),claimed:false};if(useCoupon)d.used++;save(d);return choices.length===1?claim(id,choices[0]):choices.length?{pending:true,id}:null;}
 function chooser(id,container,onDone){const d=read(),o=d.orders[id];if(!o||o.claimed||!o.choices.length)return;const title=document.createElement('h2');title.textContent='오늘의 최애는 누구?';const desc=document.createElement('p');desc.textContent='주문한 떡볶이 중 스탬프 1장을 선택해 주세요.';const grid=document.createElement('div');grid.style.cssText='display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:12px 0';let selected=null;const confirm=document.createElement('button');confirm.textContent='스탬프 받기';confirm.disabled=true;confirm.style.cssText='background:#EA4028;color:white;border:0;padding:14px;width:100%;font-weight:bold';for(const kind of o.choices){const b=document.createElement('button');b.type='button';b.style.cssText='background:#fff8eb;border:3px solid #d8cdbf;padding:8px;cursor:pointer;border-radius:12px;position:relative;color:#392520';const img=document.createElement('img');img.src=new URL('sub/collection/img/stamp_'+kind+'.png',Auth.root);img.alt=names[kind];img.style.cssText='width:100%;height:140px;object-fit:contain';const mark=document.createElement('span');mark.textContent='○ 선택하기';mark.style.cssText='display:block;font-weight:700;margin-top:6px';img.style.opacity='0.65';b.append(img,document.createTextNode(names[kind]),mark);b.setAttribute('aria-pressed','false');b.onclick=()=>{selected=kind;for(const x of grid.children){x.style.borderColor=x===b?'#EA4028':'#d8cdbf';x.style.background=x===b?'#FFE1D5':'#FFF9EF';x.style.boxShadow=x===b?'0 0 0 2px #EA4028':'none';x.querySelector('img').style.opacity=x===b?'1':'0.65';x.querySelector('span').textContent=x===b?'✓ 선택 완료':'○ 선택하기';x.querySelector('span').style.color=x===b?'#EA4028':'#998877';x.setAttribute('aria-pressed',String(x===b));}confirm.disabled=false;};grid.append(b);}confirm.onclick=()=>{const r=claim(id,selected);if(r)onDone(r);};container.replaceChildren(title,desc,grid,confirm);}
 return {read,available,award,claim,chooser};
})();
document.addEventListener('DOMContentLoaded',()=>{
 document.querySelectorAll('.side-menu-list').forEach(list=>{
  const li=document.createElement('li'),a=document.createElement('a');
  a.href=new URL('sub/collection/collection.html',Auth.root); a.textContent='나의 입덕 컬렉션'; li.append(a);list.append(li);
 });
});
