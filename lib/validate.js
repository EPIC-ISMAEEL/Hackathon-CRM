import {randomUUID} from 'crypto';
const isDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!isNaN(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;
const txt=v=>typeof v==='string'&&v.trim().length>0;
export function validate(d,users){
 const out=[],bad=(path,msg)=>out.push({path,msg});
 const mgr=new Set(users.filter(u=>u.role==='MANAGER').map(u=>u.id)),agt=new Set(users.filter(u=>u.role==='AGENT').map(u=>u.id));
 if(!d||!Array.isArray(d.projects)||!d.projects.length){bad('projects','No projects found');return out}
 d.projects.forEach((p,i)=>{
  const a=`projects[${i}]`,n=p?.name||`#${i+1}`;
  if(!txt(p?.name))bad(`${a}.name`,'Project name is required');
  if(!txt(p?.clientName))bad(`${a}.clientName`,`Client is required (${n})`);
  if(!mgr.has(p?.managerId))bad(`${a}.managerId`,`Manager must be an existing MANAGER ID (${n}); got ${p?.managerId??'null'}`);
  if(!isDate(p?.deadline))bad(`${a}.deadline`,`Valid project deadline (YYYY-MM-DD) required (${n})`);
  if(!Array.isArray(p?.tasks))return bad(`${a}.tasks`,`Tasks must be a list (${n})`);
  p.tasks.forEach((t,j)=>{
   const b=`${a}.tasks[${j}]`,m=`${n} / ${t?.title||'task #'+(j+1)}`;
   if(!txt(t?.title))bad(`${b}.title`,`Task title is required (${m})`);
   if(!agt.has(t?.assigneeId))bad(`${b}.assigneeId`,`Assignee must be an existing AGENT ID (${m}); got ${t?.assigneeId??'null'}`);
   if(!(Number(t?.estimatedHours)>0))bad(`${b}.estimatedHours`,`Estimated hours must be positive (${m})`);
   if(!isDate(t?.deadline))bad(`${b}.deadline`,`Valid task deadline required (${m})`);
   else if(isDate(p?.deadline)&&t.deadline>p.deadline)bad(`${b}.deadline`,`Task deadline ${t.deadline} is after project deadline ${p.deadline} (${m})`);
  });
 });
 return out;
}
export function build(d){
 const projects=[],tasks=[],createdAt=new Date();
 for(const p of d.projects){
  const id=randomUUID();
  projects.push({id,name:p.name.trim(),clientName:p.clientName.trim(),description:p.description||'',managerId:p.managerId,deadline:p.deadline,createdAt});
  for(const t of p.tasks)tasks.push({id:randomUUID(),projectId:id,title:t.title.trim(),description:t.description||'',assigneeId:t.assigneeId,deadline:t.deadline,estimatedHours:Number(t.estimatedHours),createdAt});
 }
 return{projects,tasks};
}
