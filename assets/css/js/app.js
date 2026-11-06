const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const store={get(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}},del(k){try{localStorage.removeItem(k)}catch(e){}}};
const views=['home','services','jobs','process','faq','register','dashboard','contact'];
function route(){let h=(location.hash||'#home').slice(1);if(!views.includes(h))h='home';
$$('.view').forEach(v=>v.classList.toggle('on',v.id==='v-'+h));
$$('#nav a').forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+h));scrollTo(0,0);if(h==='dashboard')dash()}
addEventListener('hashchange',route);

const JOBS=[
{id:'RU-0001',t:'Construction Site Technician',c:'Construction',loc:'Moscow',sal:90000,dur:'12 months',edu:'Technical diploma'},
{id:'RU-0002',t:'CNC Machine Operator',c:'Manufacturing',loc:'Kazan',sal:80000,dur:'24 months',edu:'ITI / Diploma'},
{id:'RU-0003',t:'Hotel Front Desk Associate',c:'Hospitality',loc:'Saint Petersburg',sal:65000,dur:'12 months',edu:'12th pass'},
{id:'RU-0004',t:'Mechanical Engineer',c:'Engineering',loc:'Yekaterinburg',sal:140000,dur:'24 months',edu:'B.E./B.Tech'},
{id:'RU-0005',t:'Warehouse Supervisor',c:'Logistics',loc:'Novosibirsk',sal:75000,dur:'12 months',edu:'Graduate'},
{id:'RU-0006',t:'IT Support Technician',c:'Technical Support',loc:'Moscow',sal:85000,dur:'12 months',edu:'Diploma / Degree'}];
const saved=new Set(store.get('saved')||[]);
$('#cat').innerHTML+=[...new Set(JOBS.map(j=>j.c))].map(c=>`<option>${c}</option>`).join('');
function renderJobs(){const q=$('#q').value.toLowerCase(),c=$('#cat').value;
let l=JOBS.filter(j=>(!c||j.c===c)&&(j.t+j.loc).toLowerCase().includes(q));
if($('#sort').value==='sal')l.sort((a,b)=>b.sal-a.sal);
$('#jobs').innerHTML=l.map(j=>`<div class="card job"><div class="top"><h3>${j.t}</h3><span class="tag">${j.id}</span></div>
<div><span class="tag">${j.c}</span><span class="tag">${j.loc}</span><span class="tag">${j.dur}</span><span class="tag ok">Sample – unverified</span></div>
<p>Employer: <span class="ph">[Verified Employer Name]</span><br>Salary: ₽${j.sal.toLocaleString('en-IN')}/month (sample)<br>Education: ${j.edu}<br>Recruitment fee: <span class="ph">[if applicable]</span></p>
<div class="tools" style="margin:0"><a class="btn sm" href="#register">Apply</a><button class="btn alt sm" data-s="${j.id}">${saved.has(j.id)?'Saved ✓':'Save job'}</button></div></div>`).join('')||'<p>No jobs match.</p>'}
$('#jobs').onclick=e=>{const id=e.target.dataset.s;if(!id)return;saved.has(id)?saved.delete(id):saved.add(id);store.set('saved',[...saved]);renderJobs()};
['q','cat','sort'].forEach(i=>$('#'+i).addEventListener('input',renderJobs));renderJobs();

const fields=$$('[data-d]');
function saveDraft(){const d={};fields.forEach(f=>d[f.id]=f.type==='checkbox'?f.checked:f.value);store.set('draft',d);$('#save').textContent='Draft saved on this device at '+new Date().toLocaleTimeString()+'.'}
function loadDraft(){const d=store.get('draft');if(!d)return;fields.forEach(f=>{if(f.type==='checkbox')f.checked=!!d[f.id];else f.value=d[f.id]||''});$('#save').textContent='We restored your saved draft. You can continue where you left off.'}
fields.forEach(f=>f.addEventListener('input',saveDraft));loadDraft();
$('#clr').onclick=()=>{store.del('draft');fields.forEach(f=>f.type==='checkbox'?f.checked=false:f.value='');$('#save').textContent='Draft cleared.'};
$('#sub').onclick=()=>{if(!$('#fn').value||!$('#em').validity.valid||!$('#em').value||!$('#mb').value||$('#pw').value.length<10){$('#save').textContent='Please fill all fields. Password needs 10+ characters.';return}
if(!$('#cn').checked){$('#save').textContent='Consent is required to create an account.';return}
$('#save').textContent='Demo only: no backend is connected yet, so no account was created.'};
$('#csub').onclick=()=>{$('#cs').textContent='Demo only: requests are not sent until the backend is connected.'};
function dash(){const d=store.get('draft');$('#dst').textContent=d&&(d.fn||d.em)?'Draft in progress for '+(d.fn||'your application')+'. Resume from the registration page.':'No application started.';
$('#saved').textContent=saved.size?JOBS.filter(j=>saved.has(j.id)).map(j=>j.t).join(', '):'None yet.'}
route();
