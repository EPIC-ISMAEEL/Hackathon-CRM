'use client';
import {useState,useEffect,useCallback} from 'react';
const api=async(url,o)=>{const r=await fetch(url,{headers:{'Content-Type':'application/json'},...o});const d=await r.json().catch(()=>({}));if(!r.ok)throw Object.assign(new Error(d.error||'Request failed'),{data:d});return d};
const PAL=['#d59b79','#7d9db9','#bd8c9a','#8eaa91','#b39bc9','#c69a68','#729b9c'];
const ini=n=>n.split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase();
const sum=ts=>ts.reduce((a,t)=>a+t.estimatedHours,0);
const VIEWS={overview:['Workspace / Overview','Customer delivery journeys','A clear view of projects, people and delivery work.'],projects:['Workspace / Projects','Client projects','Explore the projects available to your account.'],tasks:['Workspace / Tasks','Task board','Your accessible tasks, owners and delivery dates.'],team:['Workspace / People','Team directory','The people and specializations behind delivery.']};
const Av=({u,cls=''})=><div className={'avatar '+cls} style={{background:PAL[(u.idx||0)%PAL.length]}}>{ini(u.name)}</div>;

export default function App(){
 const [me,setMe]=useState(undefined),[users,setUsers]=useState([]),[projects,setProjects]=useState([]),[view,setView]=useState('overview'),[msg,setMsg]=useState(''),[detail,setDetail]=useState(null),[tx,setTx]=useState(false);
 const toast=s=>{setMsg(s);setTimeout(()=>setMsg(''),2800)};
 const load=useCallback(async()=>{const[u,p]=await Promise.all([api('/api/users'),api('/api/projects')]);setUsers(u.users.map((x,idx)=>({...x,idx})));setProjects(p.projects)},[]);
 useEffect(()=>{api('/api/auth').then(async d=>{setMe(d.user);if(d.user)await load()}).catch(()=>setMe(null))},[load]);
 const P=id=>users.find(u=>u.id===id)||{name:'Unknown',idx:0};
 const open=async id=>{try{setDetail((await api('/api/projects/'+id)).project)}catch(e){toast(e.message)}};
 const logout=async()=>{await api('/api/auth',{method:'DELETE'});setMe(null);setProjects([]);setView('overview')};
 if(me===undefined)return null;
 if(!me)return<Login onOk={async u=>{setMe(u);await load()}}/>;

 const admin=me.role==='ADMIN',agent=me.role==='AGENT';
 const tasks=projects.flatMap(p=>p.tasks.map(t=>({...t,project:p}))).sort((a,b)=>a.deadline.localeCompare(b.deadline));
 const mgrIds=[...new Set(projects.map(p=>p.managerId))];
 const load2=Object.values(tasks.reduce((m,t)=>{(m[t.assigneeId]??={id:t.assigneeId,h:0}).h+=t.estimatedHours;return m},{}));
 const maxH=Math.max(1,...load2.map(x=>x.h));
 const [eb,title,sub]=VIEWS[view];
 const go=v=>setView(v);
 const TaskRow=t=><div className="taskrow" key={t.id}><div className="taskinfo"><strong>{t.title}</strong><small>{t.project?.name&&t.project.name+' · '}{t.description&&!t.project?.name?t.description+' · ':''}Due {t.deadline}</small></div><span className="hours">{t.estimatedHours}h</span></div>;

 return<div className="app">
 <aside className="rail">
  <div className="brandmark"><img src="/logo.png" alt="J4"/></div>
  {[['overview','⌂','Overview'],['projects','▦','Projects'],['tasks','✓',agent?'My tasks':'Tasks'],['team','♙','Team']].map(([v,i,t])=><button key={v} className={view===v?'active':''} title={t} onClick={()=>go(v)}>{i}</button>)}
  {admin&&<button title="Create from transcript" onClick={()=>setTx(true)}>＋</button>}
  <button className="out" title="Sign out" onClick={logout}>⎋</button>
 </aside>
 <main>
  <header className="topbar">
   <div className="wordmark">J4<span> / workspace</span></div>
   <nav className="nav">{[['overview','Overview'],['projects','Projects'],['tasks',agent?'My tasks':'Tasks'],['team','Team']].map(([v,t])=><button key={v} className={view===v?'active':''} onClick={()=>go(v)}>{t}</button>)}</nav>
   <div className="top-actions"><span className="hint">{me.name} · {me.role.toLowerCase()}</span><div className="avatar profile" title="Sign out" style={{cursor:'pointer'}} onClick={logout}>{ini(me.name)}</div></div>
  </header>
  <section className="pagehead"><div><div className="eyebrow">{eb}</div><h1>{title}</h1><div className="sub">{sub}</div></div>
   <div className="headtools"><button className="btn" onClick={()=>go('team')}>Team directory</button>{admin&&<button className="btn dark" onClick={()=>setTx(true)}>＋ Create from transcript</button>}</div></section>

  <section className={'view'+(view==='overview'?' active':'')}><div className="content">
   <div className="panel">
    <div className="panelhead"><div><h2>Project journey</h2><p>Work grouped by project manager</p></div><div className="small-actions"><button onClick={()=>load().then(()=>toast('Refreshed'))}>↻</button></div></div>
    <div className="teamstrip">{users.filter(u=>u.role!=='ADMIN').map(u=><div className="team-person" key={u.id}><Av u={u}/><small>{u.name.split(' ')[0]}</small></div>)}</div>
    <div className="stats">{[['Visible projects',projects.length,'Client engagements'],['Tasks',tasks.length,agent?'Assigned to you':'Across your workspace'],['Estimated effort',sum(tasks)+'h','Developer hours']].map(([l,v,t])=><div className="stat" key={l}><label>{l}</label><strong>{v}</strong><div className="trend">{t}</div></div>)}</div>
    <div className="journey" style={{gridTemplateColumns:`repeat(${Math.max(1,Math.min(3,mgrIds.length))},minmax(0,1fr))`}}>
     {mgrIds.length?mgrIds.map(m=><div className="stage" key={m}><h3>{P(m).name}<span className="stage-count">{projects.filter(p=>p.managerId===m).length}</span></h3>
      {projects.filter(p=>p.managerId===m).map(p=><div className="project-card" key={p.id} onClick={()=>open(p.id)}><div className="project-top"><strong>{p.name}</strong><span>↗</span></div><p>{p.clientName}</p><div className="mini-meta"><span>{p.tasks.length} tasks · {p.deadline.slice(5)}</span><div className="mini-avatars">{[...new Set(p.tasks.map(t=>t.assigneeId))].slice(0,3).map(a=><Av key={a} u={P(a)}/>)}</div></div></div>)}</div>)
     :<div className="stage empty">No projects yet.{admin&&' Use “Create from transcript”.'}</div>}
    </div>
   </div>
   <div className="rightstack">
    <div className="panel"><div className="panelhead"><div><h2>{agent?'My task queue':'Next deadlines'}</h2><p>{agent?'Items assigned to you':'Earliest tasks due'}</p></div><span className="pill">{tasks.length} tasks</span></div>
     <div className="tasklist">{tasks.slice(0,5).map(TaskRow)}{!tasks.length&&<div className="empty">No tasks yet.</div>}</div></div>
    <div className="panel"><div className="panelhead"><div><h2>Workload</h2><p>Estimated hours per developer</p></div></div>
     {load2.map(x=><div className="wl" key={x.id}><Av u={P(x.id)} cls="" /><span className="nm">{P(x.id).name}</span><div className="bar"><i style={{width:x.h/maxH*100+'%'}}/></div><span className="hours">{x.h}h</span></div>)}{!load2.length&&<div className="empty">No data.</div>}</div>
   </div>
  </div></section>

  <section className={'view'+(view==='projects'?' active':'')}><div className="panel">
   <div className="panelhead"><div><h2>Projects</h2><p>{projects.length} project{projects.length===1?'':'s'} available to {me.role.toLowerCase()}</p></div>{admin&&<button className="btn dark" onClick={()=>setTx(true)}>＋ Create from transcript</button>}</div>
   <div className="listgrid">{projects.map(p=><div className="bigproject" key={p.id} onClick={()=>open(p.id)}><div className="project-top"><span className="pill">{P(p.managerId).name}</span><span className="muted">↗</span></div><h3 style={{marginTop:13}}>{p.name}</h3><p>{p.clientName} · {p.description}</p><div className="foot"><span>{p.tasks.length} tasks · {sum(p.tasks)} estimated hours</span><span>Due {p.deadline}</span></div></div>)}{!projects.length&&<div className="empty">No projects available.</div>}</div>
  </div></section>

  <section className={'view'+(view==='tasks'?' active':'')}><div className="panel">
   <div className="panelhead"><div><h2>{agent?'My tasks':'Task board'}</h2><p>Tasks available to your account</p></div><span className="pill">{tasks.length} tasks · {sum(tasks)}h</span></div>
   <div className="tablewrap"><table className="table"><thead><tr><th>TASK</th><th>PROJECT</th><th>ASSIGNEE</th><th>DEADLINE</th><th>EST. HOURS</th></tr></thead><tbody>
    {tasks.map(t=><tr key={t.id}><td><b>{t.title}</b><div className="muted">{t.description}</div></td><td>{t.project.name}</td><td><div className="personcell"><Av u={P(t.assigneeId)}/>{P(t.assigneeId).name}</div></td><td>{t.deadline}</td><td>{t.estimatedHours}h</td></tr>)}
    {!tasks.length&&<tr><td colSpan="5" className="empty">No tasks.</td></tr>}</tbody></table></div>
  </div></section>

  <section className={'view'+(view==='team'?' active':'')}><div className="panel">
   <div className="panelhead"><div><h2>Team directory</h2><p>NovaWorks people and specializations</p></div><span className="pill">{users.length} members</span></div>
   <div className="tablewrap"><table className="table"><thead><tr><th>PERSON</th><th>ROLE</th><th>SPECIALIZATION</th><th>SKILLS</th></tr></thead><tbody>
    {users.map(u=><tr key={u.id}><td><div className="personcell"><Av u={u}/><b>{u.name}</b></div></td><td><span className={'pill '+(u.role==='ADMIN'?'red':u.role==='MANAGER'?'':'green')}>{u.role}</span></td><td>{u.specialization}</td><td className="muted">{u.skills.join(', ')}</td></tr>)}</tbody></table></div>
  </div></section>
 </main>

 {detail&&<div className="modalback show" onClick={e=>e.target===e.currentTarget&&setDetail(null)}><div className="modal">
  <div className="modalhead"><div><div className="eyebrow">Project details</div><h2>{detail.name}</h2></div><button className="close" onClick={()=>setDetail(null)}>✕</button></div>
  <p className="sub">{detail.description}</p>
  <div className="detailgrid">{[['CLIENT',detail.clientName],['PROJECT MANAGER',P(detail.managerId).name],['DEADLINE',detail.deadline],['TASKS VISIBLE',detail.tasks.length]].map(([k,v])=><div className="detailbox" key={k}><small>{k}</small><strong>{v}</strong></div>)}</div>
  <div className="panelhead"><h2>Assigned work</h2><span className="pill">{sum(detail.tasks)} estimated hours</span></div>
  <div className="tasklist">{detail.tasks.map(t=><div className="taskrow" key={t.id}><div className="taskinfo"><strong style={{whiteSpace:'normal'}}>{t.title}</strong><small>{t.description}<br/>Owner: {P(t.assigneeId).name} · Due {t.deadline}</small></div><span className="hours">{t.estimatedHours}h</span></div>)}</div>
 </div></div>}
 {tx&&<Transcript onClose={()=>setTx(false)} onDone={async()=>{await load();toast('Projects and tasks created')}} onView={()=>{setTx(false);go('projects')}}/>}
 <div className={'toast'+(msg?' show':'')}>{msg}</div>
 </div>;
}

function Login({onOk}){
 const[email,setEmail]=useState('admin@novaworks.example'),[pw,setPw]=useState('Demo123!'),[err,setErr]=useState(''),[busy,setBusy]=useState(false);
 const go=async()=>{setBusy(true);setErr('');try{onOk((await api('/api/auth',{method:'POST',body:JSON.stringify({email,password:pw})})).user)}catch(e){setErr(e.message);setBusy(false)}};
 return<div className="login show"><div className="loginbox"><img src="/logo.png" alt="J4"/><div className="eyebrow" style={{marginTop:24}}>Welcome back</div><h1>Sign in to J4</h1><p>Use one of the fictional demo accounts supplied for the challenge.</p>
  <div className="field"><label>Email address</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)}/></div>
  <div className="field"><label>Password</label><input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==='Enter'&&go()}/></div>
  {err&&<div className="issues">{err}</div>}
  <button className="btn dark" disabled={busy} onClick={go}>{busy?<><span className="spin"/>Signing in…</>:'Sign in →'}</button>
  <div className="hint" style={{marginTop:14}}>Demo password for all accounts: <b>Demo123!</b></div></div></div>;
}

function Transcript({onClose,onDone,onView}){
 const[text,setText]=useState(''),[busy,setBusy]=useState(false),[err,setErr]=useState(''),[issues,setIssues]=useState(null),[draft,setDraft]=useState(''),[replace,setReplace]=useState(true),[done,setDone]=useState(null);
 const run=async body=>{
  if(busy)return;setBusy(true);setErr('');
  try{const d=await api('/api/transcript',{method:'POST',body:JSON.stringify({...body,replace})});setIssues(null);setDone(d.created);await onDone()}
  catch(e){if(e.data?.issues){setIssues(e.data.issues);setDraft(JSON.stringify(e.data.draft,null,2));setErr(e.message)}else setErr(e.message)}
  setBusy(false);
 };
 const revalidate=()=>{try{run({draft:JSON.parse(draft)})}catch{setErr('Draft is not valid JSON.')}};
 const Spin=({t})=><><span className="spin"/>{t}</>;
 return<div className="modalback show"><div className="modal">
  <div className="modalhead"><div><div className="eyebrow">AI workflow / meeting to execution</div><h2>Create projects from meeting</h2></div><button className="close" onClick={onClose}>✕</button></div>
  {done?<><div className="ok">Created {done.length} projects and {done.reduce((a,p)=>a+p.tasks,0)} tasks: {done.map(p=>`${p.name} (${p.tasks})`).join(', ')}.</div><div className="modalfoot"><span/><button className="btn dark" onClick={onView}>View projects →</button></div></>
  :<>
   <p className="sub">Paste a meeting transcript. Gemini extracts projects, tasks, owners, deadlines and estimated hours using the team directory.</p>
   {!issues&&<div className="field"><label>Meeting transcript</label><textarea value={text} disabled={busy} onChange={e=>setText(e.target.value)} placeholder="Paste meeting notes or transcript here..."/></div>}
   {err&&<div className="issues">{err}{issues&&<ul>{issues.map((i,k)=><li key={k}>{i.msg}</li>)}</ul>}</div>}
   {issues&&<div className="field"><label>AI draft — correct the unresolved fields, then revalidate</label><textarea className="mono" value={draft} disabled={busy} onChange={e=>setDraft(e.target.value)}/></div>}
   <div className="modalfoot">
    <label className="check-row"><input type="checkbox" checked={replace} onChange={e=>setReplace(e.target.checked)}/>Replace existing projects &amp; tasks</label>
    {issues?<span style={{display:'flex',gap:8}}><button className="btn" disabled={busy} onClick={()=>{setIssues(null);setErr('')}}>Edit transcript</button><button className="btn dark" disabled={busy} onClick={revalidate}>{busy?<Spin t="Saving…"/>:'Revalidate & save'}</button></span>
    :<button className="btn dark" disabled={busy||!text.trim()} onClick={()=>run({transcript:text})}>{busy?<Spin t="Processing meeting…"/>:'✦ Create projects & tasks'}</button>}
   </div></>}
 </div></div>;
}
