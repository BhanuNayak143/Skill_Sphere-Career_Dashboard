const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

function navigate(page){
  $$('.page').forEach(p=>p.classList.remove('active'));
  const target = $('#page-'+page) || $('#page-dashboard');
  target.classList.add('active');
  $$('.nav-link[data-page]').forEach(a=>a.classList.toggle('active', a.dataset.page===page));
  const link = $(`.nav-link[data-page="${page}"]`);
  $('#pageTitle').textContent = link ? link.textContent.trim() : 'Dashboard';
  history.replaceState(null,'','#'+page);
  window.scrollTo({top:0,behavior:'smooth'});
  $('#sidebar').classList.remove('open');
  setTimeout(drawCharts, 50);
}

$$('.nav-link[data-page]').forEach(link=>link.addEventListener('click',e=>{
  e.preventDefault(); navigate(link.dataset.page);
}));

function showToast(msg){
  const toast=$('#toast'); toast.textContent=msg; toast.classList.add('show');
  clearTimeout(window.toastTimer); window.toastTimer=setTimeout(()=>toast.classList.remove('show'),2200);
}
window.showToast=showToast;

$('#menuBtn').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
$('#notificationBtn').addEventListener('click',()=>showToast('You have 3 new recommendations'));

$('#themeToggle').addEventListener('click',()=>{
  document.body.classList.toggle('dark');
  const dark=document.body.classList.contains('dark');
  localStorage.setItem('skillsphere-dark',dark?'1':'0');
  $('#themeToggle').innerHTML=dark?'<span>☀</span> Light mode':'<span>☾</span> Dark mode';
  drawCharts();
});
if(localStorage.getItem('skillsphere-dark')==='1'){
  document.body.classList.add('dark');
  $('#themeToggle').innerHTML='<span>☀</span> Light mode';
}

$$('.task input').forEach(input=>input.addEventListener('change',()=>{
  input.closest('.task').classList.toggle('done',input.checked);
  input.closest('.task').querySelector('i').textContent=input.checked?'✓':'○';
  showToast(input.checked?'Task completed 🎉':'Task reopened');
}));

$$('.filter').forEach(btn=>btn.addEventListener('click',()=>{
  $$('.filter').forEach(x=>x.classList.remove('active'));btn.classList.add('active');
  const f=btn.dataset.filter;
  $$('.skill-card').forEach(card=>card.style.display=(f==='all'||card.dataset.category===f)?'block':'none');
}));

$('#jobSearch').addEventListener('input',filterJobs);
$('#jobType').addEventListener('change',filterJobs);
function filterJobs(){
  const q=$('#jobSearch').value.toLowerCase(), type=$('#jobType').value.toLowerCase();
  $$('.job-card').forEach(card=>{
    const text=card.dataset.search, kind=card.querySelector('.job-side small').textContent.toLowerCase();
    card.style.display=(text.includes(q)&&(type==='all'||kind===type))?'grid':'none';
  });
}
$$('.apply-btn').forEach(btn=>btn.addEventListener('click',()=>showToast('Role details opened')));

function openModal(id){$('#'+id).classList.add('show')}
function closeModal(id){$('#'+id).classList.remove('show')}
window.openModal=openModal;window.closeModal=closeModal;
$$('.modal-backdrop').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('show')}));

function addSkill(){
  const name=$('#newSkill').value.trim();
  if(!name){showToast('Enter a skill name');return}
  const card=document.createElement('article');card.className='skill-card';card.dataset.category='tools';
  card.innerHTML=`<div class="skill-top"><div class="skill-logo git">+</div><span class="level learning">Learning</span></div><h3>${escapeHtml(name)}</h3><p>New skill added to your toolkit</p><div class="bar"><i style="width:10%"></i></div><div class="skill-foot"><span>10%</span><small>Start practicing</small></div>`;
  $('.skills-grid').prepend(card);closeModal('skillModal');$('#newSkill').value='';showToast(`${name} added to your skills`);
}
window.addSkill=addSkill;

function addProject(){
  const name=$('#newProject').value.trim();
  if(!name){showToast('Enter a project name');return}
  const card=document.createElement('article');card.className='project-card';
  card.innerHTML=`<div class="project-cover cover-one"><span>NEW PROJECT</span><div>✦</div></div><div class="project-body"><div class="project-title"><h2>${escapeHtml(name)}</h2><span class="status progress-status">In progress</span></div><p>Your new portfolio project. Add details as you build it.</p><div class="project-tags"><span>New</span><span>Portfolio</span></div><div class="project-foot"><span>Created just now</span><button onclick="showToast('Project editor opened')">Edit →</button></div></div>`;
  $('.projects-grid').prepend(card);closeModal('projectModal');$('#newProject').value='';showToast(`${name} created`);
}
window.addProject=addProject;
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}

function lineChart(canvasId,data,labels){
  const canvas=$('#'+canvasId);if(!canvas)return;const ctx=canvas.getContext('2d'),w=canvas.clientWidth||700,h=canvas.clientHeight||250,dpr=devicePixelRatio||1;
  canvas.width=w*dpr;canvas.height=h*dpr;ctx.scale(dpr,dpr);ctx.clearRect(0,0,w,h);
  const dark=document.body.classList.contains('dark'), grid=dark?'#2d2d38':'#e9e9ef', muted=dark?'#777789':'#a1a2ad', primary='#7355ff';
  const pad={l:8,r:8,t:15,b:25}, max=Math.max(...data)*1.2, x=(i)=>pad.l+i*(w-pad.l-pad.r)/(data.length-1), y=v=>pad.t+(h-pad.t-pad.b)*(1-v/max);
  ctx.strokeStyle=grid;ctx.lineWidth=1;
  for(let i=0;i<4;i++){let yy=pad.t+i*(h-pad.t-pad.b)/3;ctx.beginPath();ctx.moveTo(0,yy);ctx.lineTo(w,yy);ctx.stroke()}
  ctx.beginPath();data.forEach((v,i)=>i?ctx.lineTo(x(i),y(v)):ctx.moveTo(x(i),y(v)));ctx.strokeStyle=primary;ctx.lineWidth=3;ctx.stroke();
  const fill=ctx.createLinearGradient(0,0,0,h);fill.addColorStop(0,'rgba(115,85,255,.18)');fill.addColorStop(1,'rgba(115,85,255,0)');
  ctx.lineTo(x(data.length-1),h-pad.b);ctx.lineTo(x(0),h-pad.b);ctx.closePath();ctx.fillStyle=fill;ctx.fill();
  data.forEach((v,i)=>{ctx.beginPath();ctx.arc(x(i),y(v),4,0,Math.PI*2);ctx.fillStyle=primary;ctx.fill();});
  ctx.font='9px DM Sans';ctx.fillStyle=muted;labels.forEach((l,i)=>ctx.fillText(l,x(i)-8,h-5));
}
function drawCharts(){
  lineChart('activityChart',[2.2,4.1,2.8,5.3,4.7,6.1,5.8],['Fri','Sat','Sun','Mon','Tue','Wed','Thu']);
  lineChart('analyticsChart',[5,8,6,10,7,12,9,14,11,16,13,18],['W1','W2','W3','W4','W5','W6','W7','W8','W9','W10','W11','W12']);
  const heat=$('#heatmap');if(heat&&!heat.children.length){for(let i=0;i<84;i++){const x=document.createElement('i');x.dataset.v=Math.floor(Math.random()*5);heat.appendChild(x)}}
}
window.addEventListener('resize',drawCharts);
window.addEventListener('hashchange',()=>{const p=location.hash.replace('#','')||'dashboard';navigate(p)});
drawCharts();
const initial=location.hash.replace('#','')||'dashboard';navigate(initial);
