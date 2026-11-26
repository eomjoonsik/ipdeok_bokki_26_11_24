const $=id=>document.getElementById(id);
const user=Auth.user();
if(!user){$('guest').hidden=false;$('intro').textContent='회원만의 특별한 수집 혜택을 만나보세요.';$('login').onclick=Auth.login;}
else{ $('member').hidden=false;const data=Collection.read(), n=data.cards.length, progress=n%5;
$('intro').textContent=user.name+'님, 오늘의 최애를 모아보세요!';$('progress').textContent=progress+' / 5';$('remaining').textContent='다음 빅쿠폰까지 '+(5-progress)+'회';$('bar').value=progress;$('coupons').textContent='사용 가능한 빅쿠폰 '+Collection.available()+'장';$('count').textContent=n+'장';
function card(c){const a=document.createElement('article'),img=document.createElement('img'),title=document.createElement('strong'),p=document.createElement('p');img.src='img/stamp_'+c.kind+'.png';img.alt=c.name;title.textContent=c.name;p.textContent=c.date?new Date(c.date).toLocaleDateString('ko-KR'): '다음 주문에서 획득';a.append(img,title,p);if(c.items){const details=document.createElement('p');details.textContent=c.items.join(' / ');a.append(details);}$('cards').append(a);}
Object.entries(data.orders).filter(([id,o])=>!o.claimed&&o.choices.length).forEach(([id,o])=>{const section=document.createElement('section');section.style.cssText='border:2px solid #392520;padding:14px;margin:16px 0;background:#fff8eb';$('pending-stamps').append(section);Collection.chooser(id,section,()=>location.reload());});
[...data.cards].reverse().forEach(card);for(let i=0;i<5-progress;i++)card({kind:'mystery',name:'미수집'});
}